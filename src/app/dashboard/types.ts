type SharedChatProps = {
    textAreaRef: React.RefObject<HTMLTextAreaElement | null>;
    input: string;
    chatLog: string;
    loading: boolean;
};

export type ChatInputProps = SharedChatProps & {
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    onSubmit: (e: React.FormEvent) => void;
};



export type ExpandedProps = SharedChatProps & {
    handleSubmit: (e: React.FormEvent) => void;
    setInput: React.Dispatch<React.SetStateAction<string>>;
    setExpanded: React.Dispatch<React.SetStateAction<boolean>>;
    setDirection: React.Dispatch<React.SetStateAction<'left' | 'right'>>;
};


export type CollapsedProps = ExpandedProps & {
    streamResponse: string;
};