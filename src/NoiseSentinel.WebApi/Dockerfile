FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /repo

COPY src/nuget.config ./src/nuget.config
COPY src/NoiseSentinel.WebApi/NoiseSentinel.WebApi.csproj ./src/NoiseSentinel.WebApi/
COPY src/NoiseSentinel.BLL/NoiseSentinel.BLL.csproj ./src/NoiseSentinel.BLL/
COPY src/NoiseSentinel.DAL/NoiseSentinel.DAL.csproj ./src/NoiseSentinel.DAL/

RUN dotnet restore ./src/NoiseSentinel.WebApi/NoiseSentinel.WebApi.csproj

COPY src/ ./src/
WORKDIR /repo/src/NoiseSentinel.WebApi
RUN dotnet publish -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
ENV ASPNETCORE_URLS=http://0.0.0.0:5200
EXPOSE 5200
COPY --from=build /app/publish/ .
ENTRYPOINT ["dotnet", "NoiseSentinel.WebApi.dll"]
