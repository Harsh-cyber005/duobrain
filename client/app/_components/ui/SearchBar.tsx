import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SearchIcon } from "@/app/_icons/SearchIcon";
import { FilterIcon } from "@/app/_icons/FilterIcon";
import { TickIcon } from "@/app/_icons/TickIcon";

interface SearchBarProps {
    s?: string;
    f?: "youtube" | "instagram" | "pinterest" | "links" | "tweets" | "document" | "all" | "";
}

const filters: Array<"youtube" | "instagram" | "pinterest" | "links" | "tweets" | "document" | "all"> = [
    "youtube", "instagram", "pinterest", "links", "tweets", "document", "all"
];

const SearchBar: React.FC<SearchBarProps> = ({ s = "", f = "" }) => {
    const [search, setSearch] = useState<string>("");
    const [filterSelected, setFilterSelected] = useState<SearchBarProps["f"]>("");
    const [filterOpen, setFilterOpen] = useState<boolean>(false);
    const router = useRouter();

    useEffect(()=>{
        setSearch(s);
        setFilterSelected(f);
    },[s,f]);

    useEffect(() => {
        if (f) setFilterSelected(f);
    }, [f]);

    const handleSearch = () => {
        if (!search.trim()) return;
        const query = `/v/s=${encodeURIComponent(search)}&f=${filterSelected || "all"}`;
        router.push(query);
    };

    const handleFilterChange = (filter: SearchBarProps["f"]) => {
        setFilterSelected(filter);
        setFilterOpen(false);
        if (filter) {
            const query = `/v/s=${encodeURIComponent(search)}&f=${filter}`;
            router.push(query);
        }
    };

    return (
        <div className="fixed bottom-5 right-5 flex items-center gap-3 p-3 bg-white shadow-xl rounded-full border border-gray-300">
            <form className="flex items-center gap-3" onSubmit={(e)=>{
                e.preventDefault();
                handleSearch();
            }}>
                <input
                    type="text"
                    placeholder="Search anything..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value.replace(/[+&=]/g, ""))}
                    className="px-4 py-2 w-48 bg-gray-100 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button onClick={handleSearch} className="p-2 bg-primaryBtn text-white rounded-full shadow hover:bg-primaryBtn-hover">
                    <SearchIcon className="text-white stroke-white" size="md" />
                </button>
            </form>
            <button onClick={() => setFilterOpen(!filterOpen)} className="p-2 bg-gray-200 rounded-full shadow hover:bg-gray-300">
                <FilterIcon size="md" />
            </button>
            {filterOpen && (
                <div className="absolute bottom-20 right-2 bg-white shadow-lg rounded-lg border border-gray-300 w-40">
                    {filters.map((item) => (
                        <div
                            key={item}
                            onClick={() => handleFilterChange(item)}
                            className={`p-2 flex justify-between items-center cursor-pointer hover:bg-gray-100 ${filterSelected === item ? "bg-gray-200" : ""}`}
                        >
                            {item}
                            {filterSelected === item && <TickIcon size="md" />}
                        </div>
                    ))}
                    {filterSelected && filterSelected !== "all" && (
                        <button onClick={() => handleFilterChange("all")} className="w-full p-2 text-red-500 hover:bg-red-100 rounded-b-lg">
                            Clear Filter
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchBar;
