using Microsoft.EntityFrameworkCore.ChangeTracking;
using System.Text.Json;

namespace Catalog.Infrastructure.Data;

/// <summary>
/// EF Core ValueComparers for complex types to suppress warnings
/// </summary>
public static class ValueComparers
{
    /// <summary>
    /// ValueComparer for List&lt;string&gt; collections (e.g., Product.Images)
    /// </summary>
    public static ValueComparer<List<string>> StringListComparer { get; } = new ValueComparer<List<string>>(
        (c1, c2) => (c1 == null && c2 == null) || (c1 != null && c2 != null && c1.SequenceEqual(c2)),
        c => c.Aggregate(0, (a, v) => HashCode.Combine(a, v.GetHashCode())),
        c => c.ToList()
    );

    /// <summary>
    /// ValueComparer for Dictionary&lt;string, string&gt; collections (e.g., Product.Attributes)
    /// </summary>
    public static ValueComparer<Dictionary<string, string>> StringDictionaryComparer { get; } = new ValueComparer<Dictionary<string, string>>(
        (c1, c2) => (c1 == null && c2 == null) || (c1 != null && c2 != null && DictionariesEqual(c1, c2)),
        c => c.Aggregate(0, (a, kvp) => HashCode.Combine(a, kvp.Key.GetHashCode(), kvp.Value.GetHashCode())),
        c => c.ToDictionary(kvp => kvp.Key, kvp => kvp.Value)
    );

    private static bool DictionariesEqual(Dictionary<string, string> d1, Dictionary<string, string> d2)
    {
        if (d1.Count != d2.Count)
            return false;

        foreach (var kvp in d1)
        {
            if (!d2.TryGetValue(kvp.Key, out var value) || value != kvp.Value)
                return false;
        }

        return true;
    }
}

