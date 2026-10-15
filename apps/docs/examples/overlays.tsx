"use client";

import { UserPlus } from "lucide-react";
import { useState } from "react";

import {
  Button,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  Input,
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
  PortalButton,
  PortalConfirmDialog,
  PortalDrawer,
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Toaster,
  toast,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@kifiya/ui";

export function PopoverStory() {
  return (
    <Popover>
      <PopoverAnchor asChild>
        <div className="inline-flex gap-2">
          <PopoverTrigger asChild>
            <Button variant="outline">Filters</Button>
          </PopoverTrigger>
        </div>
      </PopoverAnchor>
      <PopoverContent>
        <p className="text-sm">Popover content anchored to the button group.</p>
      </PopoverContent>
    </Popover>
  );
}

/** Tooltips need a `TooltipProvider` above them; mount one near the app root (this site's layout does). */
export function TooltipStory() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline">Hover or focus me</Button>
      </TooltipTrigger>
      <TooltipContent>Sample tooltip</TooltipContent>
    </Tooltip>
  );
}

export function DropdownMenuStory() {
  const [showArchived, setShowArchived] = useState(false);
  const [sort, setSort] = useState("newest");
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Options</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuItem>Edit</DropdownMenuItem>
        <DropdownMenuCheckboxItem
          checked={showArchived}
          onCheckedChange={setShowArchived}
        >
          Show archived
        </DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={sort} onValueChange={setSort}>
          <DropdownMenuRadioItem value="newest">
            Newest first
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="oldest">
            Oldest first
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Export</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem>CSV</DropdownMenuItem>
            <DropdownMenuItem>PDF</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * `SheetContent` renders `SheetPortal` and `SheetOverlay` for you; they are
 * exported for custom compositions.
 */
export function SheetStory() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open sheet</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Sheet title</SheetTitle>
          <SheetDescription>
            Primitive sheet; prefer PortalDrawer for forms.
          </SheetDescription>
        </SheetHeader>
        <SheetFooter>
          <SheetClose asChild>
            <Button>Done</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export function Drawer() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <PortalButton onClick={() => setOpen(true)}>Create profile</PortalButton>
      <PortalDrawer
        open={open}
        onOpenChange={setOpen}
        title="Create profile"
        description="Sample form inside the standard drawer."
        icon={<UserPlus className="size-5" />}
        footer={
          <div className="flex justify-end gap-2">
            <PortalButton variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </PortalButton>
            <PortalButton onClick={() => setOpen(false)}>Save</PortalButton>
          </div>
        }
      >
        <div className="space-y-3 p-6">
          <Input placeholder="Profile name" aria-label="Profile name" />
        </div>
      </PortalDrawer>
    </>
  );
}

export function ConfirmDialog() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <PortalButton variant="destructive" onClick={() => setOpen(true)}>
        Reject application
      </PortalButton>
      <PortalConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Reject this application?"
        description="The applicant will be notified."
        confirmLabel="Reject"
        confirmVariant="destructive"
        onConfirm={() => setOpen(false)}
      />
    </>
  );
}

export function Toasts() {
  return (
    <>
      <Toaster />
      <div className="flex gap-2">
        <PortalButton onClick={() => toast.success("Profile saved")}>
          Success
        </PortalButton>
        <PortalButton
          variant="outline"
          onClick={() => toast.error("Could not save")}
        >
          Error
        </PortalButton>
      </div>
    </>
  );
}
