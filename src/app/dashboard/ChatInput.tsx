import { ChatInputProps } from "./types";


function ChatInput({ textAreaRef, input, chatLog, onChange, onSubmit, loading }: ChatInputProps) {
    return (
        <form onSubmit={onSubmit} className="flex flex-col w-full h-full">
            <textarea
                ref={textAreaRef}
                onKeyDown={(e) => {
                    if (!loading && e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        onSubmit(e);
                    }
                }}
                className="w-full h-full p-4 rounded-md border border-gray-300 dark:border-gray-600 resize-none text-sm font-mono bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"


                placeholder="Ask me anything..."
                value={`${chatLog}${chatLog ? '\n' : ''}User: ${input}`}
                onChange={onChange}
            />
            <button
                type="submit"
                className="mt-4 w-full h-12 bg-blue-600 text-white dark:bg-blue-600 dark:text-white hover:bg-blue-700 dark:hover:bg-blue-700 rounded-md font-medium text-sm flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"

                disabled={loading}
            >
                {loading ? (
                    <svg className="w-5 h-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                ) : (
                    'Send'
                )}
            </button>
        </form>
    );
}

export { ChatInput };