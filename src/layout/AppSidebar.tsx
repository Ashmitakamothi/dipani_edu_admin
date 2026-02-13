import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";

// Assume these icons are imported from an icon library
import {
  BoxCubeIcon,
  CalenderIcon,
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  ListIcon,
  PageIcon,
  PieChartIcon,
  PlugInIcon,
  TableIcon,
  UserCircleIcon,
  TaskIcon,
} from "../icons";
import { useSidebar } from "../context/SidebarContext";
import SidebarWidget from "./SidebarWidget";
import {
  Files, Tag, UserCircle2Icon, PieChart,
  BarChart,
  Grid,
  Settings,
  BookOpen,
  Bell,
  MessageCircle,
  Bot
} from "lucide-react";

type NavSubItem = {
  name: string;
  path: string;
  pro?: boolean;
  new?: boolean;
  subItems?: NavSubItem[];
};

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: NavSubItem[];
};

const navItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    path: "/",
  },

  {
    icon: <ListIcon />,
    name: "Courses",
    path: "/courses/all/courses"    // subItems: [
    //   { name: "Add Course", path: "/courses/add" },
    //   { name: "Courses List", path: "/courses/all/courses" },
    // ],
  },

  // {
  //   icon: <BoxCubeIcon />,
  //   name: "Course Bundle",
  //   path: "/bundles/all",
  // },
  {
    icon: <BoxCubeIcon />,
    name: "Categories",
    path: "/categories",

  },
  {
    icon: <PageIcon />,
    name: "Banner",
    path: "/banner",
  },
  {
    icon: <CalenderIcon />,
    name: "Events",
    path: "/events",
  },
  {
    icon: <UserCircleIcon />,
    name: "Jobs",
    path: "/jobs",
  },
  {
    icon: <PageIcon />,
    name: "News",
    path: "/news",
  },

  {
    icon: <PageIcon />,
    name: "Forums",
    path: "/forum",
  },
  {
    icon: <UserCircleIcon />,
    name: "Students",
    path: "/students/all",

  },
  {
    icon: <UserCircleIcon />,
    name: "Add Reporter",
    path: "/reporters/add",
  },
  {
    icon: <TableIcon />,
    name: "Assignment Submissions",
    path: "/assignments/submissions"
  },
  {
    icon: <UserCircle2Icon />,
    name: "Student Queries",
    path: "/queries/all"
  },
  {
    icon: <TableIcon />,
    name: "Support Requests",
    path: "/requests"
  },
  {
    icon: <Tag />,
    name: "Coupons",
    path: "/coupons/all"
  },
  {
    icon: <TableIcon />,
    name: "Device Approvals",
    path: "/device-approvals"
  },
  {
    icon: <MessageCircle />,
    name: "Testimonials",
    path: "/testimonials"
  },
  {
    icon: <Bot />,
    name: "AI Tool",
    path: "/ai-tool"
  },
  {
    icon: <BookOpen className="w-5 h-5" />,
    name: "Ebooks",
    path: "/ebooks/all",
    subItems: [
      { name: "All Ebooks", path: "/ebooks/all" },
      { name: "Add Ebook", path: "/ebooks/add" },
    ],
  },
  {
    icon: <PieChartIcon />,
    name: "Leaderboard Settings",
    path: "/leaderboard-setting"
  },
  {
    icon: <TaskIcon />,
    name: "Personality Test",
    path: "/personality-test"
  },
  // {
  //   icon: <Files />,
  //   name: "Analytics",
  //   subItems: [
  //     { name: "Dashboard", path: "/files/all" },
  //     { name: "Video  Logs", path: "/files/sessions" },
  //     { name: "Performance", path: "/files/projects" },
  //   ],
  // },




  //sales analytics
  {
    icon: <TableIcon />,
    name: "Sales Analytics",
    subItems: [
      { name: "User", path: "/sales/user" },
      { name: "Course", path: "/sales/course" },
      { name: "Bundle", path: "/sales/bundle" },
    ],
  }
  ,

  {
    icon: <Bell />,
    name: "Notifications",
    subItems: [
      { name: "Send Notifications", path: "/send-notification" },
      { name: "Notification History", path: "/notification-history" },
    ],
  },



  {
    icon: <PieChartIcon />,
    name: "Certifications",
    subItems: [
      {
        name: "All Templates",
        path: "/certificates-template/all",
      },
      { name: "Add Template", path: "/certificates-template/add" },
      // {
      //   name: "Certificates",
      //   path: "/certificates",
      //   subItems: [
      //     { name: "Quiz Certificates", path: "/certificates/quiz" },
      //     { name: "Completion Certificates", path: "/certificates/completion" },
      //     { name: "Certificate Templates", path: "/certificates/templates" },
      //     { name: "Create New Template", path: "/certificates/templates/new" },
      //   ],
      // },
      // { name: "Gradebook", path: "/grades/gradebook" },
      // { name: "Reports", path: "/grades/reports" },
    ],
  },
  // {
  //   icon: <CalenderIcon />,
  //   name: "Calendar",
  //   path: "/calendar",
  // },
];

const othersItems: NavItem[] = [
  // {
  //   icon: <PlugInIcon />,
  //   name: "Settings",
  //   subItems: [
  //     { name: "Profile Settings", path: "/settings/profile" },
  //     { name: "Account Settings", path: "/settings/account" },
  //   ],
  // },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();

  const [userRole, setUserRole] = useState<string | null>(() => {
    try {
      let role = localStorage.getItem("role");
      if (!role) {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          try {
            const parsed = JSON.parse(userStr);
            role = parsed?.role;
          } catch (e) {
            // ignore parse error
          }
        }
      }
      return role ? String(role).trim() : null;
    } catch (e) {
      return null;
    }
  });

  const [openSubmenu, setOpenSubmenu] = useState<string[]>([]);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  // Function to check if any subitem is active recursively
  const hasActiveSubItem = useCallback(
    (subItems: NavSubItem[]): boolean => {
      return subItems.some((subItem) => {
        if (isActive(subItem.path)) return true;
        if (subItem.subItems) return hasActiveSubItem(subItem.subItems);
        return false;
      });
    },
    [isActive]
  );

  // Auto-expand menus based on active route
  useEffect(() => {
    const activeMenus: string[] = [];

    const checkMenuItems = (items: NavItem[], prefix: string) => {
      items.forEach((nav, index) => {
        const menuKey = `${prefix}-${index}`;
        if (nav.subItems && hasActiveSubItem(nav.subItems)) {
          activeMenus.push(menuKey);

          // Check for nested submenus
          nav.subItems.forEach((subItem, subIndex) => {
            const subMenuKey = `${menuKey}-${subIndex}`;
            if (subItem.subItems && hasActiveSubItem(subItem.subItems)) {
              activeMenus.push(subMenuKey);
            }
          });
        }
      });
    };

    checkMenuItems(navItems, "main");

    setOpenSubmenu(activeMenus);
  }, [location, hasActiveSubItem]);

  // Update submenu heights when they open
  useEffect(() => {
    openSubmenu.forEach((key) => {
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    });
  }, [openSubmenu]);

  const handleSubmenuToggle = (menuKey: string) => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (prevOpenSubmenu.includes(menuKey)) {
        return prevOpenSubmenu.filter((key) => key !== menuKey);
      }
      return [...prevOpenSubmenu, menuKey];
    });
  };

  // Recursive function to render subitems
  const renderSubItems = (
    subItems: NavSubItem[],
    parentKey: string,
    level: number = 1
  ) => {
    return subItems.map((subItem, index) => {
      const subMenuKey = `${parentKey}-${index}`;
      const marginLeft = level === 1 ? "ml-9" : `ml-${9 + (level - 1) * 4}`;

      return (
        <li key={subItem.name}>
          {subItem.subItems ? (
            <>
              <button
                onClick={() => handleSubmenuToggle(subMenuKey)}
                className={`menu-dropdown-item cursor-pointer w-full text-left ${openSubmenu.includes(subMenuKey) ||
                  hasActiveSubItem(subItem.subItems || [])
                  ? "menu-dropdown-item-active"
                  : "menu-dropdown-item-inactive"
                  }`}
              >
                <span className="flex sm:flex-row items-center sm:items-center justify-between gap-4 w-full">
                  <span>{subItem.name}</span>
                  <span className="flex items-center gap-1">
                    {subItem.new && (
                      <span
                        className={`menu-dropdown-badge ${openSubmenu.includes(subMenuKey) ||
                          hasActiveSubItem(subItem.subItems || [])
                          ? "menu-dropdown-badge-active"
                          : "menu-dropdown-badge-inactive"
                          }`}
                      >
                        new
                      </span>
                    )}
                    {subItem.pro && (
                      <span
                        className={`menu-dropdown-badge ${openSubmenu.includes(subMenuKey) ||
                          hasActiveSubItem(subItem.subItems || [])
                          ? "menu-dropdown-badge-active"
                          : "menu-dropdown-badge-inactive"
                          }`}
                      >
                        pro
                      </span>
                    )}
                    <ChevronDownIcon
                      className={`w-4 h-4 transition-transform duration-200 ${openSubmenu.includes(subMenuKey) ? "rotate-180" : ""
                        }`}
                    />
                  </span>
                </span>
              </button>
              <div
                ref={(el) => {
                  subMenuRefs.current[subMenuKey] = el;
                }}
                className="overflow-hidden transition-all duration-300"
                style={{
                  height: openSubmenu.includes(subMenuKey)
                    ? `${subMenuHeight[subMenuKey]}px`
                    : "0px",
                }}
              >
                <ul className={`mt-2 space-y-1 ${marginLeft}`}>
                  {renderSubItems(subItem.subItems, subMenuKey, level + 1)}
                </ul>
              </div>
            </>
          ) : (
            <Link
              to={subItem.path}
              className={`menu-dropdown-item ${isActive(subItem.path)
                ? "menu-dropdown-item-active"
                : "menu-dropdown-item-inactive"
                }`}
            >
              {subItem.name}
              <span className="flex items-center gap-1 ml-auto">
                {subItem.new && (
                  <span
                    className={`menu-dropdown-badge ${isActive(subItem.path)
                      ? "menu-dropdown-badge-active"
                      : "menu-dropdown-badge-inactive"
                      }`}
                  >
                    new
                  </span>
                )}
                {subItem.pro && (
                  <span
                    className={`menu-dropdown-badge ${isActive(subItem.path)
                      ? "menu-dropdown-badge-active"
                      : "menu-dropdown-badge-inactive"
                      }`}
                  >
                    pro
                  </span>
                )}
              </span>
            </Link>
          )}
        </li>
      );
    });
  };

  const renderMenuItems = (items: NavItem[], menuType: "main" | "others") => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => {
        const menuKey = `${menuType}-${index}`;

        return (
          <li key={nav.name}>
            {nav.subItems ? (
              <button
                onClick={() => handleSubmenuToggle(menuKey)}
                className={`menu-item group ${openSubmenu.includes(menuKey) ||
                  hasActiveSubItem(nav.subItems)
                  ? "menu-item-active"
                  : "menu-item-inactive"
                  } cursor-pointer ${!isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "lg:justify-start"
                  }`}
              >
                <span
                  className={`menu-item-icon-size ${openSubmenu.includes(menuKey) ||
                    hasActiveSubItem(nav.subItems)
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                    }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
                {(isExpanded || isHovered || isMobileOpen) && (
                  <ChevronDownIcon
                    className={`ml-auto w-5 h-5 transition-transform duration-200 ${openSubmenu.includes(menuKey)
                      ? "rotate-180 text-brand-500"
                      : ""
                      }`}
                  />
                )}
              </button>
            ) : (
              nav.path && (
                <Link
                  to={nav.path}
                  className={`menu-item group ${isActive(nav.path)
                    ? "menu-item-active"
                    : "menu-item-inactive"
                    }`}
                >
                  <span
                    className={`menu-item-icon-size ${isActive(nav.path)
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                      }`}
                  >
                    {nav.icon}
                  </span>
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <span className="menu-item-text">{nav.name}</span>
                  )}
                </Link>
              )
            )}
            {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
              <div
                ref={(el) => {
                  subMenuRefs.current[menuKey] = el;
                }}
                className="overflow-hidden transition-all duration-300"
                style={{
                  height: openSubmenu.includes(menuKey)
                    ? `${subMenuHeight[menuKey]}px`
                    : "0px",
                }}
              >
                <ul className="mt-2 space-y-1 ml-9">
                  {renderSubItems(nav.subItems, menuKey)}
                </ul>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );

  const filteredNavItems =
    userRole === "news_editor"
      ? navItems.filter((nav) => nav.name === "News")
      : navItems;

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${isExpanded || isMobileOpen
          ? "w-[290px]"
          : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
          }`}
      >
        <Link to="/" className="flex items-end ">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <img
                className="dark:hidden h-11"
                src="/images/logo/ed-logo.png"
                alt="Logo"
              />
              <img
                className="hidden dark:block h-11"
                src="/images/logo/ed-logo.png"
                alt="Logo"
              />
              <span className="ml-1 text-lg font-semibold">edrilla</span>
            </>
          ) : (
            <img
              className="dark:hidden h-11"
              src="/images/logo/ed-logo.png"
              alt="Logo"
            />
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "justify-start"
                  }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Menu"
                ) : (
                  <HorizontaLDots className="size-6" />
                )}
              </h2>
              {renderMenuItems(filteredNavItems, "main")}
            </div>
            {userRole !== "news_editor" && (
              <div className="">
                <h2
                  className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                    }`}
                >
                  {isExpanded || isHovered || isMobileOpen ? (
                    "Others"
                  ) : (
                    <HorizontaLDots />
                  )}
                </h2>
                {renderMenuItems(othersItems, "others")}
              </div>
            )}
          </div>
        </nav>
        {isExpanded || isHovered || isMobileOpen ? (
          userRole !== "news_editor" ? <SidebarWidget /> : null
        ) : null}
      </div>
    </aside>
  );
};

export default AppSidebar;
