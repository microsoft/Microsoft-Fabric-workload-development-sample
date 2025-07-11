FROM mcr.microsoft.com/dotnet/sdk:8.0

# Install required dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
    wget \
    apt-transport-https \
    software-properties-common \
    lsb-release \
    gnupg \
    ca-certificates \
    curl \
    git \
    zip \
    unzip \
    nano \
    jq

# Install PowerShell
RUN curl -sSL https://packages.microsoft.com/keys/microsoft.asc | apt-key add - \
    && echo "deb [arch=amd64] https://packages.microsoft.com/repos/microsoft-debian-$(lsb_release -rs)-prod $(lsb_release -rs) main" > /etc/apt/sources.list.d/microsoft.list \
    && apt-get update \
    && apt-get install -y powershell

# Install Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs

# Install Azure CLI
RUN curl -sL https://aka.ms/InstallAzureCLIDeb | bash

# Install common utilities
RUN apt-get install -y --no-install-recommends \
    git \
    zip \
    unzip \
    curl \
    nano \
    jq \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Verify PowerShell installation
RUN pwsh -Command "Write-Host 'PowerShell version:' (Get-Host).Version"

# Set PowerShell as default shell
CMD [ "pwsh", "-NoLogo" ]