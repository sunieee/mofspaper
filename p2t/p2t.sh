#!/bin/bash

function print() {
    echo -e "\033[;3$1m$2\033[0m\t$3"
}

function isCmdExist() {
	local cmd="$1"
  	if [ -z "$cmd" ]; then
		echo "Usage isCmdExist yourCmd"
		return 1
	fi

	which "$cmd" >/dev/null 2>&1
	if [ $? -eq 0 ]; then
		return 0
	fi

	return 2
}

function installNode() {
    print 4 "node" "not found! Installing..."
    if [ `uname` = "Linux" ];then
        cd /usr/local/src/
        wget https://nodejs.org/dist/v14.16.1/node-v14.16.1-linux-x64.tar.xz    # 下载
        tar xf node-v14.16.1-linux-x64.tar.xz         # 解压
        ln -s /usr/local/src/node-v14.16.1-linux-x64/bin/node /usr/bin/node
        ln -s /usr/local/src/node-v14.16.1-linux-x64/bin/npm /usr/bin/npm
    else
        brew install node
    fi
}

function installConvert() {
    print 4 "convert.js" "not found! Installing..."
    wget http://sunie.tpddns.cn:9052/material/mofs-paper/p2t/convert.js -O $srcPath/convert.js
    cd $srcPath
    npm install jsdom
}

function installPdfToHtml() {
    print 4 "pdf2htmlEX" "not found! Installing..."

    if [ `uname` = "Linux" ];then
        test -s /tmp/pdf2htmlEX.deb || wget http://sunie.tpddns.cn:9052/files/pdf2htmlEX.deb -O /tmp/pdf2htmlEX.deb
        cd /tmp
        sudo apt install ./pdf2htmlEX.deb
    else
        # dependency should be installed first (use: brew update)
        # brew install glib xorgproto gnu-getopt fribidi harfbuzz
        brew install pdf2htmlex
    fi
}

workDir=`pwd`
srcPath="$HOME/.local/src"
mkdir -p $srcPath       # 源码存储的地方

print 3 "examing your environment..."
isCmdExist "node" && print 4 "node" "exists" || installNode
test -s $srcPath/convert.js && print 4 "convert.js" "exists" || installConvert
isCmdExist "pdf2htmlEX" && print 4 "pdf2htmlEX" "exists" || installPdfToHtml

cd $workDir
print 3 "converting..." "count of files: $#"
index=1
for path in "$@"    # 分开文件
do
    pdf=${path##*/}    # /最后一位
    file=${pdf%.*}  # 去掉最后的.*

    print 3 "($index/$#) filename:" "$pdf"
    index=$[index+1]

    exists=1
    test -s "$path" || exists=0
    if [ $exists = 0 ]; then
        print 1 "file not exist. Skip!"
    elif [ ${pdf##*.} != "pdf" ]; then
        print 1 "not a pdf file. Skip!"
    else
        print 5 "converting ${pdf} to html..."
        pdf2htmlEX "$path"
        # test $? && print 2 "${pdf} -> ${file}.html successfully" || print 1 "${pdf} -> ${file}.html failed" 

        print 5 "converting ${file}.html to txt..."
        node $srcPath/convert.js "${file}.html"
        # test $? && print 2 "${file}.html -> ${file}.txt successfully" || print 1 "${file}.html -> ${file}.txt failed" 
    fi
done