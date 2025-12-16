# Edit this configuration file to define what should be installed on
# your system. Help is available in the configuration.nix(5) man page, on
# https://search.nixos.org/options and in the NixOS manual (`nixos-help`).

{ config, lib, pkgs, ... }:

{
  imports =
    [ # Include the results of the hardware scan.
      ./hardware-configuration.nix
    ];

  # Use the systemd-boot EFI boot loader.
  boot.loader.systemd-boot.enable = true;
  boot.loader.efi.canTouchEfiVariables = true;

  networking.hostName = "vdi"; # Define your hostname.
  # Pick only one of the below networking options.
  # networking.wireless.enable = true;  # Enables wireless support via wpa_supplicant.
  networking.networkmanager.enable = true;  # Easiest to use and most distros use this by default.

  # Set your time zone.
  time.timeZone = "Africa/Addis_Ababa";

  # Configure network proxy if necessary
  # networking.proxy.default = "http://user:password@proxy:port/";
  # networking.proxy.noProxy = "127.0.0.1,localhost,internal.domain";

  # Select internationalisation properties.
  i18n.defaultLocale = "en_US.UTF-8";
  #console = {
   # font = "Lat2-Terminus16";
   # keyMap = "us";
   # useXkbConfig = true; # use xkb.options in tty.
  # };

  # Enable the X11 windowing system.
  services.xserver.enable = true;


  fonts.packages = with pkgs; [
    roboto
    roboto-mono
    roboto-slab
    noto-fonts-cjk-sans
    noto-fonts-emoji
    nerd-fonts.roboto-mono
  ];

  qt = {
    enable = true;
    style = lib.mkForce "kvantum";
    platformTheme = "qt5ct"; #can be qt5ct;
  };
  
  nix.settings.experimental-features = [ "nix-command" "flakes" ];

  # Configure keymap in X11
  services.xserver.xkb.layout = "us";
  services.xserver.xkb.options = "eurosign:e,caps:escape";

  # Enable CUPS to print documents.
  # services.printing.enable = true;

  # Enable sound.
  # services.pulseaudio.enable = true;
  # OR
  services.pipewire = {
    enable = true;
    pulse.enable = true;
  };

  # Enable touchpad support (enabled default in most desktopManager).
  services.libinput.enable = true;

  # Define a user account. Don't forget to set a password with ‘passwd’.
  users.users.vdi = {
    isNormalUser = true;
    extraGroups = [ "wheel" "networkmanager" ]; # Enable ‘sudo’ for the user.
    packages = with pkgs; [
      tree
    ];
    shell = pkgs.fish;
  };

  programs.firefox.enable = true;
  programs.i3lock.enable = true;

  programs.nm-applet = {
    enable = true;
    indicator = true;
  };

  programs.fish.enable = true;

  nixpkgs.config.allowUnfree = true;
  # List packages installed in system profile.
  # You can use https://search.nixos.org/ to find more packages (and options).
  environment.systemPackages = with pkgs; [
    vim
    wget
    neovim
    swaybg
    alacritty
    wlr-randr
    htop
    rofi
    waybar
    waypaper
    git
    curl
    nemo
    brightnessctl
    wl-clipboard
    xclip
    cliphist
    clipcat
    vscode
    chromium
    libgcc
    dunst
    nitrogen
    polybar
    tint2
    fish
    gcc
    betterlockscreen
    i3lock
    xautolock
    obconf
    lxappearance
    libsForQt5.qt5ct
    libsForQt5.qtstyleplugins
    openbox-menu
    lxmenu-data
    nemo-fileroller
    xarchiver
    dconf-editor
    glib
    gsettings-desktop-schemas
    dracula-theme
    dracula-qt5-theme
    dracula-icon-theme
    telegraf
    python313
    python313Packages.pip
    pipx
  ];

  services.xserver.displayManager.sessionCommands = ''
    ${pkgs.xorg.xrdb}/bin/xrdb -merge <<EOF
    Xcursor.theme: Dracula-cursor
    Xcursor.size: 24
    EOF
  '';

  environment.variables = {
    XCURSOR_THEME = "Dracula-cursor";
    XCURSOR_SIZE = "24";
    INFLUX_TOKEN = "1U3fzAh3aTgrZwACibfv4sjHfNdVKu-VR80x4QXXoH_pGySUGSduzXmk2zUTZV50ZnTXzZHTQl6zLBXb9XmokA==";
    POSTGRES_PASSWORD = "qazwsxedc";
  };

  programs.labwc.enable = true;
  services.xserver.windowManager.openbox.enable = true;
  services.telegraf = {
    enable = true;
    environmentFiles = ["/etc/nixos/telegraf.env"];
    extraConfig = {
      global_tags = {
        dc = "us-east-1";
      };

      agent = {
        interval = "10s";
	round_interval = true;
	metric_batch_size = 1000;
	metric_buffer_limit = 10000;
	collection_jitter = "0s";
	flush_interval = "10s";
	flush_jitter = "0s";
	precision = "0s";
	hostname = "";
      };

      inputs = {
        exec = [
	{
	  commands = ["sh -c 'source /etc/os-release && echo $PRETTY_NAME'"];
	  timeout = "5s";
	  data_format = "grok";
	  name_override = "system_meta";
	  grok_patterns = ["%{GREEDYDATA:os_type}"];
	  interval = "0s";
	}

	{
	  commands = ["sh -c \"ip -4 addr show scope global | grep inet | awk '{print \\$2}' | cut -d '/' -f 1 | head -n 1\""];
	  timeout = "5s";
	  data_format = "grok";
	  name_override = "system_meta";
	  grok_patterns = ["%{IP:ip_address}"];
	  interval = "0s";
	}
	];

	cpu = {
	  percpu = true;
	  totalcpu = true;
	  collect_cpu_time = false;
	  report_active = true;
	  core_tags = false;
	};

	disk = {
	  mount_points = ["/"];
	  ignore_fs = ["tmpfs" "devtmpfs" "devfs" "iso9660" "overlay" "aufs" "squashfs"];
	};

	diskio = {};
	kernel = {};
	mem = {};
	net = {};
	processes = {};
	swap = {};
	system = {};
      };
      outputs = {
        influxdb_v2 = {
	  #urls = ["http://192.168.68.107:8086"];
	  urls = ["http://192.168.7.107:8086"];
	  token = "$INFLUX_TOKEN";
	  organization = "code_tamers";
	  bucket = "vdi_bucket";
	  timeout = "5s";
	};
      };
    };
  };

  # Display manager (Wayland-native)

  services.xserver.displayManager.lightdm = {
    enable = true;
    greeters.slick.enable = true;
  };

  #services.greetd = {
    #enable = true;
    #settings = {
      #default_session = {
        #command = "${pkgs.labwc}/bin/labwc";
        #user = "vdi";
      #};
    #};
  #};

  # Ensure seat management works
  services.dbus.enable = true;
  security.polkit.enable = true;

  #programs.regreet.enable = true;
  #programs.regreet.settings = {
    #background = "/etc/nixos/greetd_background/login.jpg";
    #scale = 1.0;
  #};

  # Enable hardware acceleration
  hardware.graphics.enable = true;
  # Some programs need SUID wrappers, can be configured further or are
  # started in user sessions.
  # programs.mtr.enable = true;
  # programs.gnupg.agent = {
  #   enable = true;
  #   enableSSHSupport = true;
  # };

  # List services that you want to enable:

  # Enable the OpenSSH daemon.
  services.openssh.enable = true;

  # Open ports in the firewall.
  # networking.firewall.allowedTCPPorts = [ ... ];
  # networking.firewall.allowedUDPPorts = [ ... ];
  # Or disable the firewall altogether.
  # networking.firewall.enable = false;

  # Copy the NixOS configuration file and link it from the resulting system
  # (/run/current-system/configuration.nix). This is useful in case you
  # accidentally delete configuration.nix.
  system.copySystemConfiguration = false;

  # This option defines the first version of NixOS you have installed on this particular machine,
  # and is used to maintain compatibility with application data (e.g. databases) created on older NixOS versions.
  #
  # Most users should NEVER change this value after the initial install, for any reason,
  # even if you've upgraded your system to a new NixOS release.
  #
  # This value does NOT affect the Nixpkgs version your packages and OS are pulled from,
  # so changing it will NOT upgrade your system - see https://nixos.org/manual/nixos/stable/#sec-upgrading for how
  # to actually do that.
  #
  # This value being lower than the current NixOS release does NOT mean your system is
  # out of date, out of support, or vulnerable.
  #
  # Do NOT change this value unless you have manually inspected all the changes it would make to your configuration,
  # and migrated your data accordingly.
  #
  # For more information, see `man configuration.nix` or https://nixos.org/manual/nixos/stable/options#opt-system.stateVersion .
  system.stateVersion = "25.05"; # Did you read the comment?

}

