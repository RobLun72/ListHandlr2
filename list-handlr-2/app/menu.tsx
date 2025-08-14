"use client";

import * as React from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  //NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  //navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { usePathname } from "next/navigation";
import { LogoutLink, LoginLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";

interface MenuComponentProps {
  topMenu: string;
  paths: string[];
  items: { title: string; path: string; href: string; description: string }[];
}

const components: MenuComponentProps[] = [
  {
    topMenu: "Actions",
    paths: ["", "lists", "about"],
    items: [
      {
        title: "Start",
        href: "/",
        path: "",
        description: "The landing page.",
      },
      {
        title: "Lists",
        href: "/lists",
        path: "lists",
        description: "The todo lists.",
      },
      {
        title: "About",
        href: "/about",
        path: "about",
        description: "Description about how the app is built.",
      },
    ],
  },
];

const unAuthComponents: MenuComponentProps[] = [
  {
    topMenu: "Actions",
    paths: ["", "about"],
    items: [
      {
        title: "Start",
        href: "/",
        path: "",
        description: "The landing page.",
      },
      {
        title: "About",
        href: "/about",
        path: "about",
        description: "Description about how the app is built.",
      },
    ],
  },
];

export function AppMenu() {
  const path = usePathname();
  const pathParts = path.split("/");

  const { isAuthenticated } = useKindeBrowserClient();

  const mapComponents: MenuComponentProps[] =
    process.env.NEXT_PUBLIC_AUTH_ACTIVE === "false"
      ? components
      : isAuthenticated
      ? components
      : unAuthComponents;

  return (
    <div className="flex md:min-w-3xl min-w-[370] max-w-7xl items-center  bg-appBlue px-4 py-2">
      <Link href="/" className="text-xl font-bold text-white mr-4">
        List Handlr
      </Link>
      <NavigationMenu>
        <NavigationMenuList>
          {mapComponents.map((component) => (
            <NavigationMenuItem key={"menu-" + component.topMenu}>
              <NavigationMenuTrigger
                className={cn(
                  "",
                  component.paths.includes(pathParts[1]) && "underline"
                )}
              >
                {component.topMenu}
              </NavigationMenuTrigger>
              <NavigationMenuContent className="bg-appWhite">
                <ul className="grid w-[200px] gap-3 p-4  grid-cols-1">
                  {component.items.map((item) => (
                    <ListItem
                      key={item.title}
                      title={item.title}
                      href={item.href}
                      className={cn(
                        "",
                        pathParts[1] === item.path && "bg-appBlue text-white"
                      )}
                    >
                      <ListItemDescription
                        className={cn(
                          "",
                          pathParts[1] !== item.path && "text-gray-400"
                        )}
                      >
                        {item.description}
                      </ListItemDescription>
                    </ListItem>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>
      {process.env.NEXT_PUBLIC_AUTH_ACTIVE === "true" && (
        <div className="flex justify-end align-middle flex-grow">
          {isAuthenticated && (
            <LogoutLink>
              <div className="text-white">Logout</div>
            </LogoutLink>
          )}
          {!isAuthenticated && (
            <LoginLink>
              <div className="text-white">Login</div>
            </LoginLink>
          )}
        </div>
      )}
    </div>
  );
}

const ListItem = ({
  className,
  title,
  href,
  children,
}: {
  className: string;
  title: string;
  href: string;
  children: React.ReactNode;
}) => {
  return (
    <li>
      <Link
        href={href}
        className={cn(
          "group block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
          className
        )}
      >
        <div className="text-sm font-medium leading-none">{title}</div>
        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
          {children}
        </p>
      </Link>
    </li>
  );
};

const ListItemDescription = ({
  className,
  children,
}: {
  className: string;
  children: React.ReactNode;
}) => {
  return (
    <p
      className={cn(
        "line-clamp-2 text-xs leading-snug text-gray-200 group-hover:text-accent-foreground",
        className
      )}
    >
      {children}
    </p>
  );
};
