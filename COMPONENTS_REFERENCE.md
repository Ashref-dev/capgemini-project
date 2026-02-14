# 🎨 Shadcn/UI Components Reference

## Overview

This project includes a comprehensive set of shadcn/ui components built with Radix UI primitives, Tailwind CSS v4, and TypeScript. All components follow the OKLCH color scheme defined in `globals.css`.

## 📂 Component Categories

### Form Components
- **[Button](#button)** - Primary interactive element with multiple variants
- **[Checkbox](#checkbox)** - Boolean input with Radix UI primitives
- **[Radio](#radio)** - Single choice selection
- **[Input](#input)** - Text input field
- **[Textarea](#textarea)** - Multi-line text input
- **[Select](#select)** - Dropdown selection with combobox support
- **[Combobox](#combobox)** - Searchable select component
- **[Label](#label)** - Form label element

### Layout Components
- **[Card](#card)** - Container with header, content, and footer
- **[Sidebar](#sidebar)** - Responsive sidebar navigation
- **[Sheet](#sheet)** - Slide-out drawer/panel component

### Dialog & Overlay Components
- **[Dialog](#dialog)** - Modal dialog
- **[Alert Dialog](#alert-dialog)** - Confirmation dialog
- **[Toast](#toast)** - Notification system
- **[Alert](#alert)** - Alert message boxes

### Data Display Components
- **[Badge](#badge)** - Label/tag component
- **[Avatar](#avatar)** - User avatar with fallback
- **[Progress](#progress)** - Progress bar
- **[Spinner](#spinner)** - Loading indicator
- **[Skeleton](#skeleton)** - Loading placeholder
- **[Tabs](#tabs)** - Tabbed content

### Navigation Components
- **[Navigation Menu](#navigation-menu)** - Dropdown navigation menu
- **[Dropdown Menu](#dropdown-menu)** - Context menu

### Utility Components
- **[Separator](#separator)** - Visual divider
- **[Field](#field)** - Form field wrapper
- **[Input Group](#input-group)** - Grouped inputs with icons

---

## 📖 Component Documentation

### Button

Multi-variant button component with icon support.

```tsx
import { Button } from "@/components/ui/button"

export function Example() {
  return (
    <>
      <Button>Default</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="destructive">Delete</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="link">Link</Button>
      
      <Button size="sm">Small</Button>
      <Button size="lg">Large</Button>
      <Button size="icon">🔍</Button>
    </>
  )
}
```

**Props:**
- `variant`: `default` | `secondary` | `destructive` | `ghost` | `outline` | `link`
- `size`: `xs` | `sm` | `default` | `lg` | `icon` | `icon-xs` | `icon-sm` | `icon-lg`
- `disabled`: boolean
- `asChild`: boolean (Slot wrapper)

---

### Checkbox

Boolean input component with Radix UI.

```tsx
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

export function Example() {
  return (
    <div className="flex items-center gap-2">
      <Checkbox id="terms" />
      <Label htmlFor="terms">I agree to terms</Label>
    </div>
  )
}
```

**Props:**
- `checked`: boolean | "indeterminate"
- `disabled`: boolean
- `onCheckedChange`: (checked: boolean) => void

---

### Radio

Single choice radio button group.

```tsx
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

export function Example() {
  return (
    <RadioGroup defaultValue="option1">
      <div className="flex items-center gap-2">
        <RadioGroupItem value="option1" id="option1" />
        <Label htmlFor="option1">Option 1</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="option2" id="option2" />
        <Label htmlFor="option2">Option 2</Label>
      </div>
    </RadioGroup>
  )
}
```

---

### Input

Text input field.

```tsx
import { Input } from "@/components/ui/input"

export function Example() {
  return (
    <>
      <Input placeholder="Enter text..." />
      <Input type="email" placeholder="Email..." />
      <Input type="password" placeholder="Password..." />
      <Input type="number" placeholder="Number..." />
      <Input disabled placeholder="Disabled input" />
    </>
  )
}
```

---

### Textarea

Multi-line text input.

```tsx
import { Textarea } from "@/components/ui/textarea"

export function Example() {
  return (
    <Textarea placeholder="Enter your message..." rows={4} />
  )
}
```

---

### Select

Dropdown selection component.

```tsx
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

export function Example() {
  return (
    <Select>
      <SelectTrigger>
        <SelectValue placeholder="Select option..." />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="option1">Option 1</SelectItem>
        <SelectItem value="option2">Option 2</SelectItem>
        <SelectItem value="option3">Option 3</SelectItem>
      </SelectContent>
    </Select>
  )
}
```

---

### Card

Container component with optional header, content, and footer.

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"

export function Example() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card description goes here</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Card content</p>
      </CardContent>
      <CardFooter>
        <button>Action</button>
      </CardFooter>
    </Card>
  )
}
```

---

### Dialog

Modal dialog component.

```tsx
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export function Example() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open Dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dialog Title</DialogTitle>
          <DialogDescription>Dialog description</DialogDescription>
        </DialogHeader>
        <p>Dialog content goes here</p>
      </DialogContent>
    </Dialog>
  )
}
```

---

### Alert Dialog

Confirmation dialog (built-in component).

```tsx
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

export function Example() {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">Delete</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
      </AlertDialogContent>
    </AlertDialog>
  )
}
```

---

### Toast

Toast notification system.

```tsx
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle } from "@/components/ui/toast"
import { useToast } from "@/lib/hooks/use-toast"
import { Button } from "@/components/ui/button"

export function Example() {
  const { toast } = useToast()

  return (
    <Button onClick={() => {
      toast({
        title: "Success",
        description: "Your action was successful",
      })
    }}>
      Show Toast
    </Button>
  )
}
```

**Add `<Toaster />` to your layout:**

```tsx
import { Toaster } from "@/components/ui/toaster"

export default function RootLayout() {
  return (
    <html>
      <body>
        {/* content */}
        <Toaster />
      </body>
    </html>
  )
}
```

---

### Alert

Alert message box with multiple variants.

```tsx
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { AlertCircleIcon } from "@hugeicons/react"

export function Example() {
  return (
    <>
      <Alert>
        <AlertTitle>Info</AlertTitle>
        <AlertDescription>This is an info alert</AlertDescription>
      </Alert>

      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Something went wrong</AlertDescription>
      </Alert>

      <Alert variant="warning">
        <AlertTitle>Warning</AlertTitle>
        <AlertDescription>Be careful with this action</AlertDescription>
      </Alert>

      <Alert variant="success">
        <AlertTitle>Success</AlertTitle>
        <AlertDescription>Operation completed successfully</AlertDescription>
      </Alert>
    </>
  )
}
```

**Variants:**
- `default` - Neutral style
- `destructive` - Error/danger style
- `warning` - Warning style
- `success` - Success style
- `info` - Information style

---

### Tabs

Tabbed content component.

```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

export function Example() {
  return (
    <Tabs defaultValue="tab1">
      <TabsList>
        <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        <TabsTrigger value="tab3">Tab 3</TabsTrigger>
      </TabsList>

      <TabsContent value="tab1">Tab 1 content</TabsContent>
      <TabsContent value="tab2">Tab 2 content</TabsContent>
      <TabsContent value="tab3">Tab 3 content</TabsContent>
    </Tabs>
  )
}
```

---

### Navigation Menu

Dropdown navigation menu.

```tsx
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuTrigger, NavigationMenuContent, NavigationMenuLink, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu"

export function Example() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Products</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
              <li><a href="#">Product 1</a></li>
              <li><a href="#">Product 2</a></li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}
```

---

### Sidebar

Responsive sidebar navigation.

```tsx
import { SidebarProvider, Sidebar, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset } from "@/components/ui/sidebar"

export function Example() {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <a href="/">Home</a>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <a href="/about">About</a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        {/* Main content */}
      </SidebarInset>
    </SidebarProvider>
  )
}
```

---

### Sheet

Slide-out drawer/panel component.

```tsx
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"

export function Example() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button>Open Sheet</Button>
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Sheet Title</SheetTitle>
          <SheetDescription>Sheet description</SheetDescription>
        </SheetHeader>
        <p>Sheet content goes here</p>
      </SheetContent>
    </Sheet>
  )
}
```

**Props:**
- `side`: `left` | `right` | `top` | `bottom`

---

### Badge

Label/tag component.

```tsx
import { Badge } from "@/components/ui/badge"

export function Example() {
  return (
    <>
      <Badge>Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
    </>
  )
}
```

---

### Avatar

User avatar with fallback.

```tsx
import { Avatar, AvatarImg, AvatarFallback } from "@/components/ui/avatar"

export function Example() {
  return (
    <>
      <Avatar>
        <AvatarImg src="https://github.com/shadcn.png" alt="User" />
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>

      <Avatar size="lg" shape="square">
        <AvatarImg src="..." />
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>
    </>
  )
}
```

**Props:**
- `size`: `xs` | `sm` | `base` | `lg` | `xl`
- `shape`: `circle` | `square`

---

### Progress

Progress bar component.

```tsx
import { Progress } from "@/components/ui/progress"

export function Example() {
  return (
    <>
      <Progress value={33} />
      <Progress value={66} size="lg" />
      <Progress value={100} size="sm" />
    </>
  )
}
```

**Props:**
- `value`: number (0-100)
- `size`: `sm` | `base` | `lg`

---

### Spinner

Loading spinner icon.

```tsx
import { Spinner } from "@/components/ui/spinner"

export function Example() {
  return (
    <>
      <Spinner />
      <Spinner size="lg" color="secondary" />
      <Spinner size="sm" color="destructive" />
    </>
  )
}
```

**Props:**
- `size`: `xs` | `sm` | `base` | `lg` | `xl`
- `color`: `primary` | `secondary` | `accent` | `destructive` | `muted` | `foreground`

---

### Skeleton

Loading placeholder skeleton.

```tsx
import { Skeleton } from "@/components/ui/skeleton"

export function Example() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-12 w-12 rounded-full" />
      <Skeleton className="h-4 w-[200px]" />
      <Skeleton className="h-4 w-[150px]" />
    </div>
  )
}
```

---

### Separator

Visual divider component.

```tsx
import { Separator } from "@/components/ui/separator"

export function Example() {
  return (
    <>
      <div>Section 1</div>
      <Separator />
      <div>Section 2</div>
    </>
  )
}
```

---

### Label

Form label component.

```tsx
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

export function Example() {
  return (
    <div>
      <Label htmlFor="email">Email</Label>
      <Input id="email" type="email" />
    </div>
  )
}
```

---

### Field

Form field wrapper with label and helper text.

```tsx
import { Field, FieldLabel, FieldDescription, FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function Example() {
  return (
    <Field>
      <FieldLabel htmlFor="username">Username</FieldLabel>
      <Input id="username" />
      <FieldDescription>Your unique username</FieldDescription>
    </Field>
  )
}
```

---

### Input Group

Grouped inputs with icon support.

```tsx
import { InputGroup, InputGroupIcon, InputGroupContent } from "@/components/ui/input-group"
import { Input } from "@/components/ui/input"

export function Example() {
  return (
    <InputGroup>
      <InputGroupIcon>🔍</InputGroupIcon>
      <InputGroupContent>
        <Input placeholder="Search..." />
      </InputGroupContent>
    </InputGroup>
  )
}
```

---

### Combobox

Searchable select component.

```tsx
import { Combobox, ComboboxTrigger, ComboboxInput, ComboboxContent, ComboboxEmpty, ComboboxItem } from "@/components/ui/combobox"

export function Example() {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState("")

  return (
    <Combobox open={open} onOpenChange={setOpen} value={value} onValueChange={setValue}>
      <ComboboxTrigger asChild>
        <Input />
      </ComboboxTrigger>
      <ComboboxContent>
        <ComboboxEmpty>No results found</ComboboxEmpty>
        <ComboboxItem value="option1">Option 1</ComboboxItem>
        <ComboboxItem value="option2">Option 2</ComboboxItem>
      </ComboboxContent>
    </Combobox>
  )
}
```

---

### Dropdown Menu

Context/dropdown menu component.

```tsx
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

export function Example() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>Menu</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Edit</DropdownMenuItem>
        <DropdownMenuItem>Delete</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Archive</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

---

## 🎨 Design System

All components adhere to the OKLCH color scheme defined in `globals.css`:

**Light Mode:**
- Primary: `oklch(0.488 0.243 264.376)` - Blue
- Secondary: `oklch(0.967 0.001 286.375)` - Light Gray
- Accent: `oklch(0.97 0 0)` - White
- Destructive: `oklch(0.58 0.22 27)` - Red
- Muted: `oklch(0.97 0 0)` - Off-white

**Dark Mode:**
- Primary: `oklch(0.42 0.18 266)` - Darker Blue
- Secondary: `oklch(0.274 0.006 286.033)` - Dark Gray
- Background: `oklch(0.145 0 0)` - Dark

---

## 🚀 Best Practices

1. **Import from `/components/ui/` path** - All components use the path alias `@/components/ui/`
2. **Use TypeScript** - All components are fully typed
3. **Responsive Design** - Components use Tailwind's responsive prefixes (sm, md, lg)
4. **Accessibility** - Built with Radix UI for WCAG compliance
5. **Dark Mode Support** - All components support light/dark mode via `.dark` class
6. **HugeIcons** - Use icons from `@hugeicons/react` for consistency

---

## 📦 Theme Customization

All color and size values can be customized in `app/globals.css` by modifying the CSS variables in `:root` and `.dark` selectors.

```css
:root {
  --primary: oklch(...);
  --secondary: oklch(...);
  --accent: oklch(...);
  --destructive: oklch(...);
  --radius: 0.625rem;
}
```

---

## 🔗 Resources

- [Radix UI Documentation](https://radix-ui.com)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [HugeIcons Documentation](https://hugeicons.com)
- [OKLCH Color Space](https://oklch.evilmartians.io)
