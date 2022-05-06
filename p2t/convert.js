const src = process.argv[2];

let filename = src.substring(src.lastIndexOf('/')+1);
let txtDest = filename.replace(".html", ".txt")

const { assert } = require("console");
const fs = require("fs");
const content = fs.readFileSync(src);

const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const dom = new JSDOM(content);
let document = dom.window.document;
let iterator = document.createNodeIterator(
  document.getElementById("page-container"),
  0x1, // NodeFilter.SHOW_ELEMENT
  {
    acceptNode(node) {
      if (node.nodeName == "DIV") {
        return 1; //NodeFilter.FILTER_ACCEPT
      }
    },
  }
);

let currentNode;
while ((currentNode = iterator.nextNode())) {
  if (
    /^\s*$/.test(currentNode.textContent) &&
    !currentNode.hasAttribute("data-page-no") &&
    !currentNode.hasAttribute("data-data") &&
    !currentNode.hasAttribute("data-page-url") &&
    !currentNode.hasAttribute("data-dest-detail")
  ) {
    currentNode.parentNode.removeChild(currentNode);
  } 
}

// function queryList(json, arr) {
//     for (let i = 0; i < json.length; i++) {
//         let sonList = json[i].sonList;
//         if (sonList.length == 0) {
//             arr.push(json[i]);
//         } else {
//             queryList(sonList, arr);
//         }
//     }
//     return arr;
// }
// leafNode = queryList(document.sonList, [])

// leafNode = []
function traverseNodes(node, leafNode){
    if(node.nodeType == 1){
        // 元素节点
        // leafNode.push(node);
        // assert(node.hasChildNodes)
        //得到所有的子节点
        let sonnodes = node.childNodes;
        //遍历所哟的子节点
        for (let i = 0; i < sonnodes.length; i++) {
            //得到具体的某个子节点
            let sonnode = sonnodes.item(i);
            //递归遍历
            traverseNodes(sonnode, leafNode);
        }
    }else{
        // 叶结点
        // display(node);
        leafNode.push(node);
    }
    return leafNode
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}
function replaceAll(str, match, replacement){
   return str.replace(new RegExp(escapeRegExp(match), 'g'), ()=>replacement);
}

function printStyle(element) {
    let out = "";
    let elementStyle = element.style;
    let computedStyle = window.getComputedStyle(element, null);

    for (prop in elementStyle) {
    if (elementStyle.hasOwnProperty(prop)) {
        out += "  " + prop + " = '" + elementStyle[prop] + "' > '" + computedStyle[prop] + "'\n";
    }
    }
    console.log(out)
}

console.log("removing _")
let emptyCollection = document.getElementsByClassName("_")
for (let i = 0; i < emptyCollection.length; i++) {
    let node = emptyCollection[i]
    // if (node.className == "_") {
    //     node.parentNode.removeChild(node);
    // } else {
    // printStyle(node)
    // console.log(node, node.offsetWidth)
    w = node.offsetWidth
    if(w === undefined || w < 5) {
        // 间隙过小则直接为空
        node.nodeValue = ""
        // node.parentNode.removeChild(node);
    } else {
        node.nodeValue = " "
    }
}

console.log("removing -, adding <return> at line end")
let divCollection = document.getElementsByTagName("div")
for (let i = 0; i < divCollection.length; i++) {
    let node = divCollection[i]
    let leafNode = traverseNodes(node, [])
    if (leafNode.length > 0) {
        // first
        // node = leafNode[0]
        // s = node.nodeValue
        // if(lastNode !== undefined && lastNode.nodeValue.endsWith(". ") && !s.startsWith('[')) {
        //     node.nodeValue = '\n' + s
        // }
        // last
        node = leafNode[leafNode.length-1]
        s = node.nodeValue
        if(s.endsWith('-')) node.nodeValue = s.substring(0, s.length-1)
        else if (s.endsWith('.')) node.nodeValue = s + "\n"
        else node.nodeValue = s + " "
    }
}

console.log("adding <space> between li")
let liSet = new Set()
let ulCollection = document.getElementsByTagName("ul")
for (let i = 0; i < ulCollection.length; i++) {
    let node = ulCollection[i]
    let leafNode = traverseNodes(node, [])
    if (leafNode.length > 0) {
        leafNode.forEach(ele => {
          liSet.add(ele)
        });
    }
}
liSet.forEach(ele => {
  ele.nodeValue = ele.nodeValue + " "
})



const header = "<!DOCTYPE html>\n";
const footer = ''
fs.writeFileSync(
  src,
  header + document.documentElement.outerHTML + footer,
  (err) => {
    if (err) {
      throw new Error(err);
    }
  }
);

let text = document.body.textContent.trim()

fs.writeFileSync(txtDest, text, (err) => {
  if (err) {
    throw new Error(err);
  }
});