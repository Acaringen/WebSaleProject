# User Secrets Kullanım Kılavuzu

## User Secrets Nedir?

User Secrets, hassas bilgileri (connection string, API key vb.) kaynak kodunuzdan ayırmak için kullanılan .NET mekanizmasıdır. Lokal geliştirme ortamında `appsettings.Development.json` yerine kullanılabilir.

---

## Kurulum ve Kullanım

### 1. User Secrets'ı Başlatın

```bash
cd services/Catalog/Catalog.Api
dotnet user-secrets init
```

Bu komut `.csproj` dosyasına bir `UserSecretsId` ekler.

---

### 2. Connection String Ekleyin

```bash
# PostgreSQL Connection String
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=localhost;Port=5432;Database=catalog;Username=websale;Password=websale123;SSL Mode=Disable;Timeout=15;Command Timeout=30"

# Redis Connection String
dotnet user-secrets set "ConnectionStrings:Redis" "localhost:6379"

# Kafka Bootstrap Servers
dotnet user-secrets set "Kafka:BootstrapServers" "localhost:9092"
```

---

### 3. Tüm Secrets'ları Listeleyin

```bash
dotnet user-secrets list
```

**Çıktı:**
```
ConnectionStrings:DefaultConnection = Host=localhost;Port=5432;Database=catalog;...
ConnectionStrings:Redis = localhost:6379
Kafka:BootstrapServers = localhost:9092
```

---

### 4. Tek Bir Secret'ı Silin

```bash
dotnet user-secrets remove "ConnectionStrings:DefaultConnection"
```

---

### 5. Tüm Secrets'ları Temizleyin

```bash
dotnet user-secrets clear
```

---

## Öncelik Sırası

Configuration değerleri aşağıdaki sırayla yüklenir (son üsttekini override eder):

1. `appsettings.json` (base/varsayılan)
2. `appsettings.Development.json` (Development ortamında)
3. `appsettings.Container.json` (Container içinde çalışırken, `DOTNET_RUNNING_IN_CONTAINER=true`)
4. **User Secrets** (lokal geliştirme, Production'da devre dışı)
5. Environment Variables (docker-compose, sistem env)
6. Command-line arguments

---

## Örnek Senaryo

### Lokal Geliştirme (User Secrets ile):

```bash
# Secrets'ı ayarla
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=localhost;Port=5432;Database=catalog_dev;Username=myuser;Password=mypass"

# Çalıştır
dotnet run
```

**Sonuç:** User Secrets'taki değer kullanılır.

---

### Lokal Geliştirme (User Secrets olmadan):

```bash
# Secrets yoksa
dotnet run
```

**Sonuç:** `appsettings.Development.json`'daki değer kullanılır.

---

### Container İçinde:

```bash
docker compose up catalog-service
```

**Sonuç:** 
- `DOTNET_RUNNING_IN_CONTAINER=true` olduğu için `appsettings.Container.json` yüklenir
- Environment Variables (docker-compose.yml) bunları override eder

---

## Güvenlik Notları

✅ **User Secrets güvenlidir çünkü:**
- Kaynak kodunuzda görünmez
- Git'e commit edilmez
- Her geliştirici kendi lokal secrets'ını yönetir

⚠️ **Dikkat:**
- User Secrets **sadece Development** ortamında çalışır
- Production'da **Environment Variables** veya **Azure Key Vault** gibi çözümler kullanın

---

## Dosya Konumu

User Secrets şu konumda saklanır:

**Windows:**
```
%APPDATA%\Microsoft\UserSecrets\<user_secrets_id>\secrets.json
```

**macOS/Linux:**
```
~/.microsoft/usersecrets/<user_secrets_id>/secrets.json
```

---

## secrets.json Örneği

Eğer dosyayı manuel düzenlemek isterseniz:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=catalog;Username=websale;Password=websale123;SSL Mode=Disable;Timeout=15;Command Timeout=30",
    "Redis": "localhost:6379"
  },
  "Kafka": {
    "BootstrapServers": "localhost:9092"
  }
}
```

---

## Takım İçinde Paylaşım

Her geliştirici kendi secrets'ını oluşturmalıdır. Takım için ortak bir **secrets template** dosyası oluşturabilirsiniz:

**secrets.template.json** (Git'e commit edilebilir):
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=catalog;Username=YOUR_USERNAME;Password=YOUR_PASSWORD",
    "Redis": "localhost:6379"
  }
}
```

Yeni geliştirici:
1. Template'i kopyalar
2. Kendi değerlerini doldurur
3. `dotnet user-secrets` komutlarıyla yükler

