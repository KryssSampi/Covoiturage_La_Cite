# Build
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy tout d'abord (évite les problèmes de parenthèses dans COPY)
COPY . .

# Naviguer dans le dossier projet et builder
WORKDIR "/src/Covoiturage_La_Cite(Server_Core)/Covoiturage_La_Cite(Server_Core)"
RUN dotnet restore
RUN dotnet publish -c Release -o /app/publish /p:UseAppHost=false

# Runtime
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:10000
EXPOSE 10000

ENTRYPOINT ["dotnet", "Covoiturage_La_Cite(Server_Core).dll"]
