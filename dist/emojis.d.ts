export declare type Description = {
    text: string;
    icon?: string;
};
export declare type EmojiMap = {
    [k: string]: Description;
};
declare const emojiMap: EmojiMap;
export default emojiMap;
