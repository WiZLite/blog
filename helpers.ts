export function getUrlHash(text: string): string {
    return `#${text.toLowerCase()
        .replaceAll(" ", "-")
        .replaceAll("　", "-")
        .replaceAll(/[^0-9a-zA-Zぁ-んァ-ヶｱ-ﾝﾞﾟ一-龠ー「」]/g, "")}`
}

export function extractDescription(markdown: string): string {
    // let maruIndex = markdown.indexOf("。", expectLength - 20);
    // if(maruIndex > expectLength + 15) maruIndex = expectLength;
    // if(maruIndex < expectLength - 15) maruIndex = expectLength;
    // return markdown.substring(0, expectLength * 2)
    //     .replaceAll("#", "") // ヘッディングを消す
    //     .replaceAll(/\[(\w+)\]\(.+\)/g, (_,w) => w)
    //     .substring(0, maruIndex + 1) // リンクを文字だけにする
    return markdown.substring(0, markdown.indexOf("#"))
}