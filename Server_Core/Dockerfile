# Build
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY ["Covoiturage_La_Cite(Server_Core)/Covoiturage_La_Cite(Server_Core)/Covoiturage_La_Cite(Server_Core).csproj", "Covoiturage_La_Cite(Server_Core)/Covoiturage_La_Cite(Server_Core)/"]
RUN dotnet restore "Covoiturage_La_Cite(Server_Core)/Covoiturage_La_Cite(Server_Core)/Covoiturage_La_Cite(Server_Core).csproj"

COPY . .
RUN dotnet publish "Covoiturage_La_Cite(Server_Core)/Covoiturage_La_Cite(Server_Core)/Covoiturage_La_Cite(Server_Core).csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:10000
EXPOSE 10000

ENTRYPOINT ["dotnet", "Covoiturage_La_Cite(Server_Core).dll"]
