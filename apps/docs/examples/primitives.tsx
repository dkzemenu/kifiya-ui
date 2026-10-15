"use client";

import { Plus } from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Separator,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@kifiya/ui";

export function Buttons() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button>Default</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="link">Link</Button>
      <Button size="icon" aria-label="Add">
        <Plus />
      </Button>
      <Button disabled>Disabled</Button>
    </div>
  );
}

export function Badges() {
  return (
    <div className="flex gap-2">
      <Badge>Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="outline">Outline</Badge>
    </div>
  );
}

export function Avatars() {
  return (
    <div className="flex gap-3">
      <Avatar>
        <AvatarImage src="" alt="" />
        <AvatarFallback>AT</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>MK</AvatarFallback>
      </Avatar>
    </div>
  );
}

export function Cards() {
  return (
    <Card className="max-w-sm">
      <CardHeader>
        <CardTitle>Agent summary</CardTitle>
        <CardDescription>Sample data for the docs.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm">12 agents onboarded this week.</p>
      </CardContent>
      <CardFooter>
        <Button size="sm">View all</Button>
      </CardFooter>
    </Card>
  );
}

export function Skeletons() {
  return (
    <div className="max-w-sm space-y-3">
      <Skeleton className="h-6 w-1/2" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  );
}

export function Separators() {
  return (
    <div className="max-w-sm">
      <p className="text-sm">Above</p>
      <Separator className="my-3" />
      <p className="text-sm">Below</p>
      <div className="mt-4 flex h-6 items-center gap-3 text-sm">
        <span>Left</span>
        <Separator orientation="vertical" />
        <span>Right</span>
      </div>
    </div>
  );
}

export function BasicTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Agent</TableHead>
          <TableHead>Region</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Sample Agent One</TableCell>
          <TableCell>Region A</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Sample Agent Two</TableCell>
          <TableCell>Region B</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
