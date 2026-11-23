
import { useEffect, useRef, useState } from "react";

import {
    Bot,
    Send,
    Sparkles,
    Package,
    BarChart3,
    Megaphone,
    RefreshCw,
    Copy,
    MessageSquare,
} from "lucide-react";

import aiAdminService from "../../services/ai-admin.service";

const SUGGESTIONS = [
    "Analyze my business performance.",
    "What are my biggest inventory problems?",
    "Which products are selling fastest?",
    "What should I restock?",
    "How can I increase revenue?",
];

function renderInlineText(text) {
    const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);

    return parts.map((part, index) => {
        if (/^\*\*[^*]+\*\*$/.test(part)) {
            return (
                <strong key={index}>
                    {part.slice(2, -2)}
                </strong>
            );
        }

        if (/^`[^`]+`$/.test(part)) {
            return (
                <code
                    key={index}
                    className="rounded bg-slate-200 px-1 py-0.5 font-mono text-[0.9em]"
                >
                    {part.slice(1, -1)}
                </code>
            );
        }

        return <span key={index}>{part}</span>;
    });
}

function FormattedAIText({ text }) {
    if (typeof text !== "string" || !text.trim()) {
        return <p>No formatted response was returned.</p>;
    }

    const lines = text.replace(/\r\n/g, "\n").split("\n");
    const blocks = [];
    let listItems = [];
    let paragraphLines = [];

    const flushParagraph = () => {
        if (!paragraphLines.length) return;
        blocks.push(
            <p key={`paragraph-${blocks.length}`} className="mb-3 leading-7">
                {renderInlineText(paragraphLines.join(" ").trim())}
            </p>
        );
        paragraphLines = [];
    };

    const flushList = () => {
        if (!listItems.length) return;
        blocks.push(
            <ul key={`list-${blocks.length}`} className="mb-3 list-disc space-y-1 pl-5">
                {listItems.map((item, index) => (
                    <li key={index}>{renderInlineText(item)}</li>
                ))}
            </ul>
        );
        listItems = [];
    };

    lines.forEach((line) => {
        const trimmed = line.trim();

        if (!trimmed) {
            flushParagraph();
            flushList();
            return;
        }

        const heading = trimmed.match(/^#{1,3}\s+(.+)$/);
        if (heading) {
            flushParagraph();
            flushList();
            blocks.push(
                <h3
                    key={`heading-${blocks.length}`}
                    className="mb-2 mt-1 text-sm font-bold text-slate-900"
                >
                    {renderInlineText(heading[1])}
                </h3>
            );
            return;
        }

        const listItem = trimmed.match(/^[-*]\s+(.+)$/);
        if (listItem) {
            flushParagraph();
            listItems.push(listItem[1]);
            return;
        }

        const numberedItem = trimmed.match(/^\d+[.)]\s+(.+)$/);
        if (numberedItem) {
            flushParagraph();
            flushList();
            blocks.push(
                <p
                    key={`numbered-${blocks.length}`}
                    className="mb-2 leading-7"
                >
                    {renderInlineText(trimmed)}
                </p>
            );
            return;
        }

        if (/^[-|:\s]+$/.test(trimmed)) {
            flushParagraph();
            flushList();
            return;
        }

        if (/^\|.*\|$/.test(trimmed)) {
            flushParagraph();
            flushList();
            const cells = trimmed
                .split("|")
                .slice(1, -1)
                .map((cell) => cell.trim());
            blocks.push(
                <div
                    key={`table-row-${blocks.length}`}
                    className="mb-1 grid border-b border-slate-200 py-1"
                    style={{
                        gridTemplateColumns: `repeat(${cells.length}, minmax(0, 1fr))`,
                    }}
                >
                    {cells.map((cell, index) => (
                        <span key={index} className="px-2">
                            {renderInlineText(cell)}
                        </span>
                    ))}
                </div>
            );
            return;
        }

        paragraphLines.push(trimmed);
    });

    flushParagraph();
    flushList();

    return <div className="text-sm leading-7">{blocks}</div>;
}

export default function AdminAIAssistant() {
    const messagesEndRef = useRef(null);

    const [activeTab, setActiveTab] = useState("chat");

    const [messages, setMessages] = useState([]);

    const [message, setMessage] = useState("");

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");

    const [inventory, setInventory] = useState(null);

    const [contentType, setContentType] =
        useState("product_description");

    const [productName, setProductName] = useState("");

    const [details, setDetails] = useState("");

    const [generatedContent, setGeneratedContent] =
        useState("");

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
        });
    }, [messages, loading]);

    async function sendMessage(value = message) {

        const text = value.trim();

        if (!text || loading) return;

        const previousMessages = messages;

        const history = previousMessages.map(item => ({
            role: item.role,
            content: item.content,
        }));

        setMessages(previous => [
            ...previous,
            {
                role: "user",
                content: text,
            },
        ]);

        setMessage("");
        setLoading(true);
        setError("");

        try {

            const response = await aiAdminService.chat(
                text,
                history.slice(-6)
            );

            const result =
                response?.data?.data ??
                response?.data ??
                response;

            setMessages(previous => [
                ...previous,
                {
                    role: "assistant",
                    content:
                        typeof result?.response === "string" &&
                        result.response.trim()
                            ? result.response
                            : "The AI response was empty. Please try again.",
                },
            ]);

        } catch (err) {

            setError(
                err.message || "Unable to generate AI response."
            );

        } finally {

            setLoading(false);

        }

    }

    async function loadInventory() {

        setLoading(true);
        setError("");

        try {

            const response =
                await aiAdminService.getInventoryInsights();

            setInventory(response.data);

        } catch (err) {

            setError(
                err.message || "Unable to load inventory insights."
            );

        } finally {

            setLoading(false);

        }

    }

    async function generateContent() {

        if (
            contentType !== "campaign" &&
            !productName.trim()
        ) {
            setError("Product name is required.");
            return;
        }

        setLoading(true);
        setError("");
        setGeneratedContent("");

        try {

            const response =
                await aiAdminService.generateContent({
                    type: contentType,
                    product_name: productName,
                    details,
                });

            setGeneratedContent(
                response.data.content
            );

        } catch (err) {

            setError(
                err.message || "Content generation failed."
            );

        } finally {

            setLoading(false);

        }

    }

    const tabs = [
        {
            id: "chat",
            label: "AI Assistant",
            icon: MessageSquare,
        },
        {
            id: "inventory",
            label: "Inventory AI",
            icon: Package,
        },
        {
            id: "content",
            label: "Content Studio",
            icon: Megaphone,
        },
    ];

    return (

        <div className="space-y-6">

            <div>
                <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-indigo-100 p-3 text-indigo-700">
                        <Bot size={25} />
                    </div>

                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">
                            ShopSphere AI
                        </h1>

                        <p className="text-sm text-slate-500">
                            Your intelligent business assistant
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">

                {tabs.map(tab => {

                    const Icon = tab.icon;

                    return (

                        <button
                            key={tab.id}
                            onClick={() => {

                                setActiveTab(tab.id);
                                setError("");

                                if (
                                    tab.id === "inventory" &&
                                    !inventory
                                ) {
                                    loadInventory();
                                }

                            }}
                            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium ${
                                activeTab === tab.id
                                    ? "bg-indigo-600 text-white"
                                    : "bg-white text-slate-600 hover:bg-slate-100"
                            }`}
                        >
                            <Icon size={17} />
                            {tab.label}
                        </button>

                    );

                })}

            </div>

            {error && (

                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                    {error}
                </div>

            )}

            {activeTab === "chat" && (

                <div className="grid gap-5 lg:grid-cols-[1fr_280px]">

                    <div className="flex h-[clamp(440px,calc(100dvh-340px),620px)] min-h-[440px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white">

                        <div className="flex items-center gap-3 border-b p-4">
                            <Sparkles className="text-indigo-600" />

                            <div>
                                <h2 className="font-semibold">
                                    Business Assistant
                                </h2>

                                <p className="text-xs text-slate-500">
                                    Powered by OpenRouter
                                </p>
                            </div>
                        </div>

                        <div className="flex-1 space-y-4 overflow-y-auto p-5">

                            {!messages.length && (

                                <div className="py-12 text-center">

                                    <Bot
                                        size={45}
                                        className="mx-auto text-indigo-500"
                                    />

                                    <h3 className="mt-4 font-semibold">
                                        How can I help your business?
                                    </h3>

                                    <p className="mt-2 text-sm text-slate-500">
                                        Ask questions about your actual
                                        ShopSphere business data.
                                    </p>

                                </div>

                            )}

                            {messages.map((item, index) => (

                                <div
                                    key={index}
                                    className={`flex ${
                                        item.role === "user"
                                            ? "justify-end"
                                            : "justify-start"
                                    }`}
                                >

                                    <div
                                        className={`max-w-[85%] rounded-2xl p-4 text-sm ${
                                            item.role === "user"
                                                ? "bg-indigo-600 text-white"
                                                : "bg-slate-100 text-slate-800"
                                        }`}
                                    >
                                        {item.role === "assistant"
                                            ? <FormattedAIText text={item.content} />
                                            : item.content}
                                    </div>

                                </div>

                            ))}

                            {loading && activeTab === "chat" && (

                                <p className="text-sm text-slate-500">
                                    ShopSphere AI is thinking...
                                </p>

                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        <form
                            onSubmit={event => {
                                event.preventDefault();
                                sendMessage();
                            }}
                            className="flex shrink-0 gap-2 border-t p-4"
                        >

                            <input
                                value={message}
                                onChange={event =>
                                    setMessage(event.target.value)
                                }
                                placeholder="Ask about your business..."
                                className="min-w-0 flex-1 rounded-xl border px-4 py-3 outline-none focus:border-indigo-500"
                            />

                            <button
                                type="submit"
                                disabled={loading || !message.trim()}
                                className="rounded-xl bg-indigo-600 px-5 text-white disabled:opacity-50"
                            >
                                <Send size={19} />
                            </button>

                        </form>

                    </div>

                    <div className="space-y-3">

                        <h3 className="font-semibold">
                            Suggested questions
                        </h3>

                        {SUGGESTIONS.map((item, index) => (

                            <button
                                key={index}
                                onClick={() => sendMessage(item)}
                                disabled={loading}
                                className="w-full rounded-xl border bg-white p-3 text-left text-sm text-slate-600 hover:border-indigo-400 hover:text-indigo-700 disabled:opacity-50"
                            >
                                {item}
                            </button>

                        ))}

                    </div>

                </div>

            )}

            {activeTab === "inventory" && (

                <div className="space-y-5">

                    <div className="flex items-center justify-between">

                        <h2 className="text-lg font-semibold">
                            AI Inventory Intelligence
                        </h2>

                        <button
                            onClick={loadInventory}
                            disabled={loading}
                            className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"
                        >
                            <RefreshCw size={16} />
                            Refresh
                        </button>

                    </div>

                    {inventory && (

                        <>
                            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                                {[
                                    ["Total Variants", inventory.statistics.total_variants],
                                    ["Total Stock", inventory.statistics.total_stock],
                                    ["Low Stock", inventory.statistics.low_stock],
                                    ["Out of Stock", inventory.statistics.out_of_stock],
                                ].map(([label, value]) => (

                                    <div
                                        key={label}
                                        className="rounded-xl border bg-white p-5"
                                    >
                                        <p className="text-sm text-slate-500">
                                            {label}
                                        </p>

                                        <p className="mt-2 text-2xl font-bold">
                                            {Number(value).toLocaleString()}
                                        </p>
                                    </div>

                                ))}

                            </div>

                            <div className="grid gap-5 lg:grid-cols-2">

                                <div className="rounded-xl border bg-white p-5">

                                    <h3 className="mb-4 font-semibold">
                                        Low Stock Products
                                    </h3>

                                    {inventory.low_stock_products.map(item => (

                                        <div
                                            key={item.variant_id}
                                            className="flex justify-between border-b py-3 text-sm"
                                        >
                                            <span>{item.product_name}</span>

                                            <span className="font-semibold text-red-600">
                                                {item.stock} units
                                            </span>
                                        </div>

                                    ))}

                                    {!inventory.low_stock_products.length && (
                                        <p className="text-sm text-slate-500">
                                            No low-stock products.
                                        </p>
                                    )}

                                </div>

                                <div className="rounded-xl border bg-white p-5">

                                    <h3 className="mb-4 font-semibold">
                                        Fast Moving Products
                                    </h3>

                                    {inventory.fast_moving_products.map(item => (

                                        <div
                                            key={item.variant_id}
                                            className="flex justify-between border-b py-3 text-sm"
                                        >
                                            <span>{item.product_name}</span>

                                            <span className="font-semibold text-emerald-600">
                                                {item.units_sold} sold
                                            </span>
                                        </div>

                                    ))}

                                </div>

                            </div>

                            <div className="rounded-xl border bg-white p-5">

                                <h3 className="mb-4 font-semibold">
                                    AI Inventory Analysis
                                </h3>

                                <FormattedAIText text={inventory.ai_analysis} />

                            </div>

                        </>

                    )}

                    {!inventory && loading && (
                        <p className="text-sm text-slate-500">
                            Analyzing inventory...
                        </p>
                    )}

                </div>

            )}

            {activeTab === "content" && (

                <div className="grid gap-5 lg:grid-cols-2">

                    <div className="space-y-4 rounded-xl border bg-white p-5">

                        <h2 className="font-semibold">
                            AI Content Generator
                        </h2>

                        <div>
                            <label className="mb-2 block text-sm font-medium">
                                Content Type
                            </label>

                            <select
                                value={contentType}
                                onChange={event =>
                                    setContentType(event.target.value)
                                }
                                className="w-full rounded-lg border p-3"
                            >
                                <option value="product_description">
                                    Product Description
                                </option>

                                <option value="seo">
                                    SEO Content
                                </option>

                                <option value="marketing">
                                    Marketing Copy
                                </option>

                                <option value="social_caption">
                                    Social Media Caption
                                </option>

                                <option value="campaign">
                                    Campaign Ideas
                                </option>

                            </select>

                        </div>

                        {contentType !== "campaign" && (

                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Product Name
                                </label>

                                <input
                                    value={productName}
                                    onChange={event =>
                                        setProductName(event.target.value)
                                    }
                                    className="w-full rounded-lg border p-3"
                                    placeholder="Enter product name"
                                />
                            </div>

                        )}

                        <div>
                            <label className="mb-2 block text-sm font-medium">
                                Details
                            </label>

                            <textarea
                                value={details}
                                onChange={event =>
                                    setDetails(event.target.value)
                                }
                                rows={5}
                                maxLength={2000}
                                className="w-full rounded-lg border p-3"
                                placeholder="Enter product features or campaign requirements..."
                            />
                        </div>

                        <button
                            onClick={generateContent}
                            disabled={loading}
                            className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-3 font-semibold text-white disabled:opacity-50"
                        >
                            <Sparkles size={18} />
                            Generate Content
                        </button>

                    </div>

                    <div className="rounded-xl border bg-white p-5">

                        <div className="mb-4 flex items-center justify-between">

                            <h2 className="font-semibold">
                                Generated Result
                            </h2>

                            <button
                                onClick={() =>
                                    navigator.clipboard.writeText(
                                        generatedContent
                                    )
                                }
                                disabled={!generatedContent}
                                className="rounded-lg border p-2 disabled:opacity-40"
                                title="Copy content"
                            >
                                <Copy size={17} />
                            </button>

                        </div>

                        {generatedContent ? (

                            <FormattedAIText text={generatedContent} />

                        ) : (

                            <div className="py-16 text-center text-sm text-slate-400">
                                Generated content will appear here.
                            </div>

                        )}

                    </div>

                </div>

            )}

        </div>

    );

}
