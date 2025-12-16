{ config, pkgs, ... }:

{
  home.stateVersion = "25.05";

  home.username = "vdi";
  home.homeDirectory = "/home/vdi";

  home.packages = with pkgs; [
    neofetch
    htop
    ripgrep
    fd
  ];

  programs.git = {
    enable = true;
    userName = "Your Name";
    userEmail = "your.email@example.com";
  };
}
