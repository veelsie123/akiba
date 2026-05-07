"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X } from 'lucide-react';
import Link from "next/link";
import { useRouter } from "next/navigation";

interface SearchResult {
  id: string;
  title: string;
  type: "client" | "case" | "appointment" | "invoice";
  url: string;
  subtitle?: string;
}

export default function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const searchItems = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        setResults(data.results || []);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(searchItems, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      setQuery("");
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "client":
        return "👤";
      case "case":
        return "⚖️";
      case "appointment":
        return "📅";
      case "invoice":
        return "💰";
      default:
        return "📄";
    }
  };

  return (
    <div ref={searchRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search clients, cases, appointments..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="w-64 pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        {query && (
          <button
            type="button"
            title="Clear search"
            aria-label="Clear search"
            onClick={() => {
              setQuery("");
              setResults([]);
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
          >
            <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {isOpen && (query.length >= 2 || results.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
          {loading && (
            <div className="p-4 text-center text-gray-500">Searching...</div>
          )}

          {!loading && results.length === 0 && query.length >= 2 && (
            <div className="p-4 text-center text-gray-500">
              No results found for "{query}"
            </div>
          )}

          {!loading && results.length > 0 && (
            <div>
              <div className="p-2 bg-gray-50 border-b">
                <span className="text-xs text-gray-500">Results for "{query}"</span>
              </div>
              {results.map((result) => (
                <Link
                  key={`${result.type}-${result.id}`}
                  href={result.url}
                  onClick={() => {
                    setIsOpen(false);
                    setQuery("");
                    setResults([]);
                  }}
                  className="block p-3 hover:bg-gray-50 border-b last:border-b-0"
                >
                  <div className="flex items-start space-x-3">
                    <div className="text-xl">{getTypeIcon(result.type)}</div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{result.title}</div>
                      {result.subtitle && (
                        <div className="text-sm text-gray-500">{result.subtitle}</div>
                      )}
                      <div className="text-xs text-gray-400 mt-1 capitalize">{result.type}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}