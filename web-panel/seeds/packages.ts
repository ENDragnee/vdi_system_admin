// seeds/packages.ts
import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function main() {
  console.log(`Start seeding NixOS packages... ❄️`);

  const packages = [
    // Apps (Graphical)
    {
      name: "vscode",
      description: "Visual Studio Code - Professional IDE",
      version: "1.9x",
    },
    {
      name: "chromium",
      description: "Chromium Web Browser (Open Source)",
      version: "Stable",
    },
    {
      name: "firefox",
      description: "Mozilla Firefox Browser",
      version: "Stable",
    },
    { name: "vlc", description: "Universal Media Player", version: "3.x" },
    {
      name: "nemo-with-extensions",
      description: "Cinnamon file manager with extensions",
      version: "Latest",
    },

    // Terminal & Shell
    {
      name: "alacritty",
      description: "GPU-accelerated terminal emulator",
      version: "Latest",
    },
    {
      name: "htop",
      description: "Interactive process viewer",
      version: "Latest",
    },
    {
      name: "neofetch",
      description: "System information tool",
      version: "Latest",
    },
    {
      name: "ripgrep",
      description: "Extremely fast search tool (rg)",
      version: "Latest",
    },
    {
      name: "git",
      description: "Distributed version control system",
      version: "Latest",
    },

    // Development
    {
      name: "python313",
      description: "Python Programming Language v3.13",
      version: "3.13",
    },
    { name: "gcc", description: "GNU Compiler Collection", version: "Latest" },

    // System Utilities
    {
      name: "docker",
      description: "Containerization Engine",
      version: "Latest",
    },
    {
      name: "btop",
      description: "Resource monitor (Better htop)",
      version: "Latest",
    },

    // Desktop / WM Tools
    {
      name: "rofi",
      description: "Window switcher and application launcher",
      version: "Latest",
    },
    {
      name: "waypaper",
      description: "GUI Wallpaper setter for Wayland/X11",
      version: "Latest",
    },
    {
      name: "dunst",
      description: "Lightweight notification daemon",
      version: "Latest",
    },
    {
      name: "tint2",
      description: "Lightweight taskbar for X11",
      version: "Latest",
    },
  ];

  for (const pkg of packages) {
    await prisma.package.upsert({
      where: { name: pkg.name },
      update: {
        description: pkg.description,
        version: pkg.version,
      },
      create: {
        name: pkg.name,
        description: pkg.description,
        version: pkg.version,
      },
    });
    console.log(`✅ Seeded: ${pkg.name}`);
  }

  console.log(`Seeding finished. All packages ready for GitOps management.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
