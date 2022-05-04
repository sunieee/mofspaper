import os
from pdfminer.pdfparser import PDFParser
from pdfminer.pdfdocument import PDFDocument
from pdfminer.pdfpage import PDFPage
from pdfminer.pdfpage import PDFTextExtractionNotAllowed
from pdfminer.pdfinterp import PDFResourceManager
from pdfminer.pdfinterp import PDFPageInterpreter
from pdfminer.pdfdevice import PDFDevice
from pdfminer.layout import *
from pdfminer.converter import PDFPageAggregator
import os
import pandas as pd


def Pdf2Txt(pdf_path):
    fp = open(pdf_path,'rb')
    s = ''
    # 来创建一个pdf文档分析器
    parser = PDFParser(fp)
    # 创建一个PDF文档对象存储文档结构
    document = PDFDocument(parser)
    # 检查文件是否允许文本提取
    if not document.is_extractable:
        raise PDFTextExtractionNotAllowed
    else:
        # 创建一个PDF资源管理器对象来存储共赏资源
        rsrcmgr = PDFResourceManager()
        # 设定参数进行分析
        laparams = LAParams()
        # 创建一个PDF设备对象
        # device=PDFDevice(rsrcmgr)
        device = PDFPageAggregator(rsrcmgr, laparams=laparams)
        # 创建一个PDF解释器对象
        interpreter = PDFPageInterpreter(rsrcmgr, device)
        # 处理每一页
        for page in PDFPage.create_pages(document):
            interpreter.process_page(page)
            # 接受该页面的LTPage对象
            layout = device.get_result()
            for x in layout:
                if(isinstance(x, LTTextBoxHorizontal)):
                    s += x.get_text()
    return s
                    

def dropun(X):
    for x in X.columns:
        if x[:7]=='Unnamed':
              X=X.drop(columns=[x])
    return X


def has_alpha(s):
    for c in s:
        if 'A' <= c <= 'Z' or 'a' <= c <= 'z':
            return True
    return False


def pre_process(s):
    lines = s.split('\n')
    s = ''
    i = 0
    while i < len(lines):
        if has_alpha(lines[i]):
            if line[i].endswith('- '):
                s += line[i][:-2]
            else:
                line = lines[i].strip()
                s += line
                if line[-1] in [',', ';']:
                    s += ' '
                elif line[-1] == '.':
                    s += '\n'
                else:
                    s += ' '
        i += 1
    if len(s) > 1000:
        return s
    return None


def convert():
    path = 'core_qmof_pdf/'
    dest = 'core_qmof_txt/'
    if not os.path.exists(dest):
        os.mkdir(dest)

    for pdf in os.listdir(path):
        name = pdf[:-4] + '.txt'
        s = path + pdf
        d = dest + name
        if os.path.exists(d):
            continue
        try:
            s = Pdf2Txt(s)
            s = pre_process(s)
            with open(d, 'w', encoding='utf-8') as f:
                f.write(s)
        except:
            print(pdf, 'failed')


def create_heatmap(heat, subtitle):
    import seaborn as sns
    import matplotlib.pyplot as plt
    import matplotlib
    # matplotlib.use('Agg')
    # os.system('echo "backend: Agg" > ~/.config/matplotlib/matplotlibrc')

    plt.rcParams['font.sans-serif'] = ['SimHei']  # 用来正常显示中文标签
    plt.rcParams['axes.unicode_minus'] = False  # 用来正常显示负号
    f, ax = plt.subplots(figsize=(30, 10), nrows=1)
    plt.suptitle(subtitle, y=0.1, size=18)
    ax.xaxis.set_ticks_position('top')
    ax.yaxis.set_ticks_position('left')

    ax.tick_params(axis='x', labelsize=15)
    ax.tick_params(axis='y', labelsize=15)
    # ax.tick_params(axis='x', labelsize=16)
    sns.heatmap(heat, ax=ax, cbar=False, fmt='s', linewidths=0.1, annot=True, annot_kws={'fontsize': 15})
    plt.xticks(rotation=45)  # 45为旋转的角度


def test():
    pass


if __name__ == "__main__":
    convert()