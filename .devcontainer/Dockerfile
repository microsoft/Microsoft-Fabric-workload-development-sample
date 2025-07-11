FROM mcr.microsoft.com/dotnet/sdk:8.0

# Install PowerShell
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
    wget \
    apt-transport-https \
    software-properties-common \
    && wget -q "https://packages.microsoft.com/config/ubuntu/$(lsb_release -rs)/packages-microsoft-prod.deb" \
    && dpkg -i packages-microsoft-prod.deb \
    && apt-get update \
    && apt-get install -y --no-install-recommends \
    powershell

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

# Set PowerShell as default shell
ENTRYPOINT [ "pwsh" ]