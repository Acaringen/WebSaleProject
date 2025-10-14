using Confluent.Kafka;
using Microsoft.Extensions.Logging;
using System.Text.Json;
using WebSale.Shared.Abstractions.Events;

namespace Catalog.Infrastructure.Services;

public interface IEventPublisher
{
    Task PublishAsync<T>(T domainEvent, CancellationToken cancellationToken = default) where T : IDomainEvent;
}

public class EventPublisher : IEventPublisher
{
    private readonly IProducer<string, string> _producer;
    private readonly ILogger<EventPublisher> _logger;
    private readonly JsonSerializerOptions _jsonOptions;

    public EventPublisher(ILogger<EventPublisher> logger)
    {
        _logger = logger;
        _jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            WriteIndented = false
        };

        var config = new ProducerConfig
        {
            BootstrapServers = Environment.GetEnvironmentVariable("Kafka__BootstrapServers") ?? "localhost:9092",
            Acks = Acks.All,
            EnableIdempotence = true
        };

        _producer = new ProducerBuilder<string, string>(config).Build();
    }

    public async Task PublishAsync<T>(T domainEvent, CancellationToken cancellationToken = default) where T : IDomainEvent
    {
        try
        {
            var topic = GetTopicName<T>();
            var key = domainEvent.Id.ToString();
            var value = JsonSerializer.Serialize(domainEvent, _jsonOptions);

            var message = new Message<string, string>
            {
                Key = key,
                Value = value,
                Headers = new Headers
                {
                    { "event-type", System.Text.Encoding.UTF8.GetBytes(domainEvent.EventType) },
                    { "occurred-on", System.Text.Encoding.UTF8.GetBytes(domainEvent.OccurredOn.ToString("O")) }
                }
            };

            await _producer.ProduceAsync(topic, message, cancellationToken);
            _logger.LogInformation("Published event {EventType} with ID {EventId} to topic {Topic}", 
                domainEvent.EventType, domainEvent.Id, topic);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to publish event {EventType} with ID {EventId}", 
                domainEvent.EventType, domainEvent.Id);
            throw;
        }
    }

    private static string GetTopicName<T>() where T : IDomainEvent
    {
        var eventType = typeof(T).Name;
        return eventType.ToLowerInvariant().Replace("event", "");
    }

    public void Dispose()
    {
        _producer?.Dispose();
    }
}
