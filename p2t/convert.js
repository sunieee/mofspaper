const src = process.argv[2];

var filename = src.substring(src.lastIndexOf('/')+1);
var txtDest = filename.replace(".html", ".txt")

const { assert } = require("console");
const fs = require("fs");
const content = fs.readFileSync(src);

const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const dom = new JSDOM(content);
var document = dom.window.document;
var iterator = document.createNodeIterator(
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

function traverseNodes(node, leafNode){
    if(node.nodeType == 1){
        // 元素节点
        // leafNode.push(node);
        // assert(node.hasChildNodes)
        //得到所有的子节点
        var sonnodes = node.childNodes;
        //遍历所哟的子节点
        for (var i = 0; i < sonnodes.length; i++) {
            //得到具体的某个子节点
            var sonnode = sonnodes.item(i);
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

function printStyle(element) {
    var out = "";
    var elementStyle = element.style;
    var computedStyle = window.getComputedStyle(element, null);

    for (prop in elementStyle) {
    if (elementStyle.hasOwnProperty(prop)) {
        out += "  " + prop + " = '" + elementStyle[prop] + "' > '" + computedStyle[prop] + "'\n";
    }
    }
    console.log(out)
}

var emptyCollection = document.getElementsByClassName("_")
for (let i = 0; i < emptyCollection.length; i++) {
    let node = emptyCollection[i]
    if (node.className == "_") {
        node.parentNode.removeChild(node);
    } else {
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
}

var divCollection = document.getElementsByTagName("div")
let lastNode
for (let i = 0; i < divCollection.length; i++) {
    let node = divCollection[i]
    let leafNode = traverseNodes(node, [])
    if (leafNode.length == 0) {
        // node.parentNode.removeChild(node)
        console.log(node)
    } else{
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
        else if (s.endsWith('.')) node.nodeValue = s + "\\rn\\"
        else node.nodeValue = s + " "
        lastNode = node
    }
}

// var divCollection = document.getElementsByTagName("div")
// for (let i = 0; i < divCollection.length; i++) {
//     let node = divCollection[i]
//     let leafNode = traverseNodes(node, [])
//     if (leafNode.length > 0) {
//         // node = leafNode[leafNode.length-1]
//         console.log(leafNode[0])
//         console.log(leafNode[leafNode.length-1])
//     }
// }



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

var text = document.body.textContent.trim()
var tmp = "\n==========page 1==========\n"
var index = 2
for (let i = 0; i < text.length; i++) {
    if (text[i] == "\n") {
        tmp += "\n==========page " + index + "==========\n"
        index += 1
    } else {
        tmp += text[i]
    }
}
// text.replace(/\n/g, "\n==========page==========\n")
text = tmp.replace(/\\rn\\/g, "\n")


fs.writeFileSync(txtDest, text, (err) => {
  if (err) {
    throw new Error(err);
  }
});
