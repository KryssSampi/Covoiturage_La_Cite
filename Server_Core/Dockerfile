# Build
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY . .

# Localise le .csproj dynamiquement — évite tout problème de chemin avec parenthèses
RUN PROJ=$(find . -name "*.csproj" | head -1) && \
    echo "Found project: $PROJ" && \
    dotnet restore "$PROJ" && \
    dotnet publish "$PROJ" -c Release -o /app/publish /p:UseAppHost=false

# Runtime
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:10000
EXPOSE 10000

ENTRYPOINT ["dotnet", "Covoiturage_La_Cite(Server_Core).dll"]
