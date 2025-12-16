{ config, pkgs, ... }:

{
  # Use the Home Manager module for Openbox.
  # It will generate ~/.config/openbox/rc.xml, menu.xml, and autostart for you.
  xsession.windowManager.openbox = {
    enable = true;

    resistance = {
      strength = 10;
      screenEdgeStrength = 20;
    };

    focus = {
      focusNew = true;
      followMouse = true;
      focusLast = true;
      underMouse = false;
      focusDelay = 200;
      raiseOnFocus = false;
    };

    placement = {
      policy = "Smart";
      center = true;
      monitor = "Primary";
      primaryMonitor = 1;
    };

    # Autostart applications when you log in.
    # The '&' is important to run them in the background.
    autostart = ''
      xrandr -s 1920x1080 &
      nitrogen --restore &
      clipcatd &
      tint2 -c ~/.config/tint2/livia/livia.tint2rc &
      dunst &
      xautolock -time 10 -locker "betterlockscreen -l" &
    '';

    # Theme settings
    theme = {
      name = "Dracula-withoutBorder";
      titleLayout = "NLIMC";
      keepBorder = true;
      animateIconify = true;
      font = {
        activeWindow = {
          name = "RobotoMono Nerd Font";
          size = 12;
          weight = "Bold";
          slant = "Normal";
        };
        inactiveWindow = {
          name = "RobotoMono Nerd Font";
          size = 12;
          weight = "Normal";
          slant = "Italic";
        };
        menuHeader = {
          name = "RobotoMono Nerd Font";
          size = 14;
          weight = "Bold";
          slant = "Normal";
        };
        menuItem = {
          name = "RobotoMono Nerd Font";
          size = 12;
          weight = "Normal";
          slant = "Normal";
        };
        activeOnScreenDisplay = {
          name = "RobotoMono Nerd Font";
          size = 14;
          weight = "Normal";
          slant = "Normal";
        };
        inactiveOnScreenDisplay = {
          name = "RobotoMono Nerd Font";
          size = 14;
          weight = "Normal";
          slant = "Normal";
        };
      };
    };

    desktops = {
      number = 4;
      firstdesk = 1;
      names = [ "" "" "󰊢" "" ];
      popupTime = 875;
    };

    resize = {
      drawContents = true;
      popupShow = "Nonpixel";
      popupPosition = "Center";
      popupFixedPosition = {
        x = 10;
        y = 10;
      };
    };

    margins = {
      top = 10;
      bottom = 50;
      left = 10;
      right = 10;
    };

    dock = {
      position = "Bottom";
      stacking = "Normal";
      direction = "Horizontal";
      autoHide = true;
      hideDelay = 300;
      showDelay = 300;
    };

    # Define your right-click desktop menu declaratively.
    menu = {
      "Terminal emulator" = {
        action = "Execute";
        command = "${pkgs.alacritty}/bin/alacritty";
      };

      "Web browser" = {
        action = "Execute";
        command = "${pkgs.firefox}/bin/firefox";
      };

      "separator-1" = {};

      "Applications" = {
        pipe = "${pkgs.openbox}/bin/openbox-menu ${pkgs.lxmenu-data}/share/applications/lxde-applications.menu";
      };

      "Open Windows" = {
        id = "client-list-menu";
      };

      "separator-2" = {};

      "Configurations" = {
        action = "Execute";
        command = "${pkgs.obconf}/bin/obconf";
      };

      "Reconfigure" = {
        action = "Reconfigure";
      };

      "separator-3" = {};

      "Exit" = {
        menu = {
          "Logout" = {
            action = "Exit";
          };

          "Suspend" = {
            action = "Execute";
            command = "systemctl suspend";
          };

          "Hibernate" = {
            action = "Execute";
            command = "systemctl hibernate";
          };

          "Reboot" = {
            action = "Execute";
            command = "systemctl reboot";
          };

          "Shutdown" = {
            action = "Execute";
            command = "systemctl poweroff";
          };
        };
      };
    };

    keybindings = {
      "C-g" = { action = "ChainQuit"; };

      # Desktop switching
      "C-A-Left" = { action = "GoToDesktop"; to = "left"; wrap = true; };
      "C-A-Right" = { action = "GoToDesktop"; to = "right"; wrap = true; };
      "C-A-Up" = { action = "GoToDesktop"; to = "up"; wrap = false; };
      "C-A-Down" = { action = "GoToDesktop"; to = "down"; wrap = false; };
      "S-A-Left" = { action = "SendToDesktop"; to = "left"; wrap = false; };
      "S-A-Right" = { action = "SendToDesktop"; to = "right"; wrap = false; };
      "S-A-Up" = { action = "SendToDesktop"; to = "up"; wrap = false; };
      "S-A-Down" = { action = "SendToDesktop"; to = "down"; wrap = false; };
      "W-1" = { action = "GoToDesktop"; to = "1"; };
      "W-2" = { action = "GoToDesktop"; to = "2"; };
      "W-3" = { action = "GoToDesktop"; to = "3"; };
      "W-4" = { action = "GoToDesktop"; to = "4"; };
      "W-d" = { action = "ToggleShowDesktop"; };

      # Window actions
      "W-c" = { action = "Close"; };
      "A-Escape" = { action = "Lower"; }; # Note: Simplified from multi-action
      "A-space" = { action = "ShowMenu"; menu = "client-menu"; };

      # Window switching
      "A-Tab" = { action = "NextWindow"; finalactions = [{ name = "Focus"; } { name = "Raise"; } { name = "Unshade"; }]; };
      "A-S-Tab" = { action = "PreviousWindow"; finalactions = [{ name = "Focus"; } { name = "Raise"; } { name = "Unshade"; }]; };
      "C-A-Tab" = { action = "NextWindow"; panels = true; desktop = true; finalactions = [{ name = "Focus"; } { name = "Raise"; } { name = "Unshade"; }]; };

      # Directional window switching
      "W-S-Right" = { action = "DirectionalCycleWindows"; direction = "right"; };
      "W-S-Left" = { action = "DirectionalCycleWindows"; direction = "left"; };
      "W-S-Up" = { action = "DirectionalCycleWindows"; direction = "up"; };
      "W-S-Down" = { action = "DirectionalCycleWindows"; direction = "down"; };

      # Tiling/Placement
      "W-Up" = { action = "MoveResizeTo"; x = "0"; y = "0"; width = "100%"; height = "50%"; };
      "W-Down" = { action = "MoveResizeTo"; x = "0"; y = "-0"; width = "100%"; height = "50%"; };
      "W-Left" = { action = "MoveResizeTo"; x = "0"; y = "0"; width = "50%"; height = "100%"; };
      "W-Right" = { action = "MoveResizeTo"; x = "-0"; y = "0"; width = "50%"; height = "100%"; };
      "W-space" = { action = "Maximize"; }; # MaximizeFull is not a standard action, Maximize is.
      "W-A-Up" = { action = "Maximize"; };
      "W-A-Down" = { action = "Iconify"; };

      # Application launchers
      "W-q" = {
        action = "Execute";
        # Note: Paths starting with `~` must be interpolated like this
        command = "${config.home.homeDirectory}/.config/rofi/applets/bin/powermenu.sh";
        startupnotify = { enable = true; name = "Rofi"; };
      };
      "W-e" = {
        action = "Execute";
        command = "${pkgs.nemo}/bin/nemo";
        startupnotify = { enable = true; name = "Rofi"; };
      };
      "W-o" = {
        action = "Execute";
        command = "${config.home.homeDirectory}/.config/rofi/launchers/type-3/launcher.sh";
        startupnotify = { enable = true; name = "Rofi"; };
      };
      "W-S-a" = {
        action = "Execute";
        command = "${pkgs.clipcat}/bin/clipcat-menu";
        startupnotify = { enable = true; name = "Clipcat Menu"; };
      };
    };

    # --- XML Section: <mouse> ---
    mousebindings = {
      # The syntax is "Context-Button-Action"
      "Frame-A-Left-Press" = { action = "Focus"; }; # Simplified from multi-action
      "Frame-A-Left-Drag" = { action = "Move"; };
      "Frame-A-Right-Drag" = { action = "Resize"; };
      "Frame-A-Middle-Press" = { action = "Lower"; }; # Simplified
      "Frame-A-Up-Click" = { action = "GoToDesktop"; to = "previous"; };
      "Frame-A-Down-Click" = { action = "GoToDesktop"; to = "next"; };
      "Titlebar-Left-Drag" = { action = "Move"; };
      "Titlebar-Left-DoubleClick" = { action = "ToggleMaximize"; };
      "Titlebar Top Right Bottom Left TLCorner TRCorner BRCorner BLCorner-Right-Press" = { action = "ShowMenu"; menu = "client-menu"; };
      "Desktop-Right-Press" = { action = "ShowMenu"; menu = "root-menu"; };
      "Root-Right-Press" = { action = "ShowMenu"; menu = "root-menu"; };
      "Root-Middle-Press" = { action = "ShowMenu"; menu = "client-list-combined-menu"; };
      "Close-Left-Click" = { action = "Close"; };
      "Maximize-Left-Click" = { action = "ToggleMaximize"; };
      "Maximize-Middle-Click" = { action = "ToggleMaximize"; direction = "vertical"; };
      "Maximize-Right-Click" = { action = "ToggleMaximize"; direction = "horizontal"; };
      "Iconify-Left-Click" = { action = "Iconify"; };
      # ... other mouse bindings can be translated in the same way ...
    };
  };
}
