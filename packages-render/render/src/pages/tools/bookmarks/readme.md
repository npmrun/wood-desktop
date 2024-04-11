https://github.com/zorapeteri/bookmarks-to-json
https://github.com/cafehaus/parse-bookmark
https://www.zhihu.com/question/627832572

1. 通过iframe解析：

// const iframeRef = ref<HTMLIFrameElement>()

// @ts-ignore
// function parseBookmarks(html) {
//     const parser = new DOMParser();
//     const doc = parser.parseFromString(html, 'text/html');

//     function buildTree(node) {
//         const bookmarkNodes = Array.from(node.children).filter(n => n.tagName === 'DT');
//         return bookmarkNodes.map(dt => {
//             const name = dt.textContent.trim();
//             const childrenNode = dt.nextElementSibling;
//             const children = childrenNode && childrenNode.tagName === 'DL'
//                 ? buildTree(childrenNode)
//                 : [];
//             return { name, children };
//         });
//     }
//     console.log(doc.body.firstElementChild);

//     // const bookmarksTree = buildTree(doc.body.firstElementChild);
//     // return JSON.stringify(bookmarksTree, null, 2);
// }

// function onIframeLoad() {
//     const document = iframeRef.value?.contentDocument
//     const window = iframeRef.value?.contentWindow
//     if (document && window) {
//         document.body.onclick = (event: Event) => {
//             // 兼容处理
//             var target = event.target as HTMLElement || event.srcElement as HTMLElement;
//             if (target) {
//                 if (target.nodeName.toLocaleLowerCase() === 'a') {
//                     // 对捕获到的 a 标签进行处理，需要先禁止它的跳转行为
//                     if (event.preventDefault) {
//                         event.preventDefault();
//                     } else {
//                         // @ts-ignore
//                         window.event.returnValue = true;
//                     }
//                     toast.warn("禁止跳转")
//                 }
//             }
//         }
//     }
// }

// onMounted(() => {
//     iframeRef.value?.addEventListener("load", onIframeLoad)
// })

// onBeforeUnmount(() => {
//     iframeRef.value?.removeEventListener("load", onIframeLoad)
// })

 <!-- <div class="my-2">请不要加载别的文件，谨防病毒！！！</div> -->
<!-- <iframe class="w-full h-0 flex-1" ref="iframeRef" :srcdoc="result" frameborder="0"></iframe> -->
