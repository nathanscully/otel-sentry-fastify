{
  pkgs,
  lib,
  config,
  inputs,
  ...
}:

{
  packages = [
    pkgs.git
    pkgs.k6
  ];
  languages.javascript = {
    enable = true;
    pnpm = {
      enable = true;
    };
    package = pkgs.nodejs_22;
  };
}
