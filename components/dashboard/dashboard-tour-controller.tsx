"use client"

import * as React from "react"
import { usePathname, useRouter } from "next/navigation"
import { driver, type Driver, type DriveStep } from "driver.js"
import "driver.js/dist/driver.css"

import { toast } from "@/components/ui/toast"

const START_TOUR_EVENT = "intelliconnect:start-tour"

function resolveElement(getter: () => Element | null) {
  return () => getter() ?? document.body
}

function getPartnersTable() {
  return document.querySelector("main table")
}

function getBiChartCard() {
  const chartHeading = Array.from(document.querySelectorAll("main h2")).find((heading) =>
    heading.textContent?.includes("Par catégorie")
  )

  return chartHeading?.closest("div") ?? null
}

function getAgentComposer() {
  return document.querySelector(
    'main input[placeholder="Ask about partners, analytics, predictions..."]'
  )
}

export function DashboardTourController() {
  const router = useRouter()
  const pathname = usePathname()
  const driverRef = React.useRef<Driver | null>(null)

  const waitForCondition = React.useCallback(
    (condition: () => boolean, timeout = 12000) =>
      new Promise<void>((resolve, reject) => {
        const startedAt = Date.now()

        const check = () => {
          if (condition()) {
            resolve()
            return
          }

          if (Date.now() - startedAt > timeout) {
            reject(new Error("Timed out while waiting for the next tour step."))
            return
          }

          window.setTimeout(check, 120)
        }

        check()
      }),
    []
  )

  const waitForElement = React.useCallback(
    async (selector: () => Element | null) => {
      await waitForCondition(() => Boolean(selector()))
    },
    [waitForCondition]
  )

  const navigateToStep = React.useCallback(
    async (targetPath: string, selector?: () => Element | null) => {
      router.push(targetPath)

      try {
        await waitForCondition(() => window.location.pathname === targetPath)

        if (selector) {
          await waitForElement(selector)
        }

        driverRef.current?.moveNext()
      } catch {
        driverRef.current?.destroy()
        toast.error("Tour interrupted", {
          description: "The target section did not load in time. Please try again.",
        })
      }
    },
    [router, waitForCondition, waitForElement]
  )

  const startTour = React.useCallback(async () => {
    driverRef.current?.destroy()

    const tour = driver({
      animate: true,
      allowClose: true,
      smoothScroll: true,
      showProgress: true,
      stagePadding: 10,
      stageRadius: 18,
      nextBtnText: "Next",
      prevBtnText: "Back",
      doneBtnText: "Finish",
      steps: [],
    })

    const steps: DriveStep[] = [
      {
        popover: {
          title: "Welcome",
          description:
            "This guided walkthrough introduces the key IntelliConnect areas for partnerships, analytics, and AI-assisted operations.",
          side: "over",
          align: "center",
          nextBtnText: "Open partner list",
          onNextClick: () => {
            void navigateToStep("/dashboard/partners", getPartnersTable)
          },
        },
      },
      {
        element: resolveElement(getPartnersTable),
        popover: {
          title: "Partner Management",
          description:
            "This live partner list is where teams review accounts, inspect statuses, and jump into communications or documents.",
          side: "top",
          align: "start",
          nextBtnText: "Open BI analytics",
          onNextClick: () => {
            void navigateToStep("/dashboard/bi", getBiChartCard)
          },
          onPrevClick: () => {
            void navigateToStep("/dashboard/demo")
          },
        },
      },
      {
        element: resolveElement(getBiChartCard),
        popover: {
          title: "BI Analytics",
          description:
            "The BI dashboard turns warehouse data into category, status, revenue, and performance views for faster decision-making.",
          side: "right",
          align: "start",
          nextBtnText: "Open AI agent",
          onNextClick: () => {
            void navigateToStep("/dashboard/agent", getAgentComposer)
          },
          onPrevClick: () => {
            void navigateToStep("/dashboard/partners", getPartnersTable)
          },
        },
      },
      {
        element: resolveElement(getAgentComposer),
        popover: {
          title: "AI Agent",
          description:
            "This assistant helps users query data, score partners, predict churn, and surface recommendations in seconds.",
          side: "top",
          align: "center",
          nextBtnText: "Wrap up",
          onNextClick: () => {
            void navigateToStep("/dashboard/demo")
          },
          onPrevClick: () => {
            void navigateToStep("/dashboard/bi", getBiChartCard)
          },
        },
      },
      {
        popover: {
          title: "Get Started",
          description:
            "You have seen the platform’s operational core. Use the quick links below to explore partner operations, BI analytics, HR management, and AI workflows in more detail.",
          side: "over",
          align: "center",
        },
      },
    ]

    tour.setSteps(steps)
    driverRef.current = tour

    if (pathname !== "/dashboard/demo") {
      router.push("/dashboard/demo")
      await waitForCondition(() => window.location.pathname === "/dashboard/demo")
    }

    tour.drive()
  }, [navigateToStep, pathname, router, waitForCondition])

  React.useEffect(() => {
    const handleStart = () => {
      void startTour()
    }

    window.addEventListener(START_TOUR_EVENT, handleStart)

    return () => {
      window.removeEventListener(START_TOUR_EVENT, handleStart)
    }
  }, [startTour])

  React.useEffect(() => {
    return () => {
      driverRef.current?.destroy()
    }
  }, [])

  return null
}
