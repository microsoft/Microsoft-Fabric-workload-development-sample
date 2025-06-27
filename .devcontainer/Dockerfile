FROM mcr.microsoft.com/devcontainers/dotnet:6.0

# Install Node.js (already has a recent version from the base image)
# But we'll ensure Angular CLI is also available globally
RUN npm install -g @angular/cli

# Install any additional tools needed
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
        curl \
        git \
        gnupg2 \
        nano \
        unzip \
        wget \
    && apt-get autoremove -y \
    && apt-get clean -y \
    && rm -rf /var/lib/apt/lists/*

# Set up the non-root user
ARG USERNAME=vscode
RUN echo $USERNAME ALL=\(root\) NOPASSWD:ALL > /etc/sudoers.d/$USERNAME \
    && chmod 0440 /etc/sudoers.d/$USERNAME

# [Optional] Set the default user
USER $USERNAME

# Set up environment variables
ENV ASPNETCORE_URLS=http://+:5000;https://+:5001
ENV DOTNET_URLS=http://+:5000;https://+:5001
ENV PATH="${PATH}:/home/${USERNAME}/.dotnet/tools"

# Install global .NET tools
RUN dotnet tool install -g dotnet-ef

# Set up workspace directory
WORKDIR /workspace