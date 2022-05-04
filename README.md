本仓库用于下载论文并进行文本挖掘

## 1. main.py

用于解析获取到的所有MOF的论文pdf（下载论文使用了软件，流程比较复杂），所有的论文都以(<DOI后缀>.pdf)形式保存。

### 1.1. 命名规范：

1. 注意DOI由(<前缀>/<后缀>)构成，而论文命名只取其后缀:
- 前缀： 10.：DOI在解析系统中的应用代号,是固定的。1016（4位数字）：由IDF的注册机构（RA）统一分配给DOI注册者的
- 后缀：注册者(如出版商)赋予的数字对象的内部唯一编码

```
'10.1016/j.jssc.2019.120926' => j.jssc.2019.120926.pdf
'10.1107/S1600536810035270' => S1600536810035270.pdf
```

2. 下载过程中出现了doi转义字符，且大小写不统一，需要将获取到的pdf文件名称进行转换（使用`rdicfy`函数，将url转移字符还原并且变为小写）：

```python
url_dic = {
    ' ': '%20',
    '"':  '%22',
    '#':  '%23',
    '%':  '%25',
    '&':  '%26',
    '(':  '%28',
    ')':  '%29',
    '+':  '%2B',
    ',':  '%2C',
    '/':  '%2F',
    ':':  '%3A',
    ';':  '%3B',
    '<':  '%3C',
    '=':  '%3D',
    '>':  '%3E',
    '?':  '%3F',
    '@':  '%40',
    '\\':  '%5C',
    '|':  '%7C'
}
url_rdic = {}
for k, v in url_dic.items():
    url_rdic[v] = k
    url_rdic[v.lower()] = k

def rdicfy(s):
    for k, v in url_rdic.items():
        s = s.replace(k, v)
    return s.lower()
```

```
s0020-1693%2897%2905478-9 => s0020-1693(97)05478-9
10.1002/1521-3773(20010601)40:11<2111::AID-ANIE2111>3.3.CO;2-6 => 10.1002/1521-3773(20010601)40:11<2111::aid-anie2111>3.3.co;2-6
```

### 1.2. 下载路径：

- CSD数据库共39579篇论文：`/mnt/data1/csd/papers/` （现有36233篇已下载，3346篇下载失败，失败列表见not_download.txt）
- CoRE数据库共5439篇论文： `/mnt/data1/mof_papers/` （基本上是CSD的子集，可直接在上面的路径中获取）

### 1.3. 通过doi寻找文件的方法：

```python
import os

doi = '10.xxxx/s0020-1693%2897%2905478-9'
filename = rdicfy(doi.split('/')[-1]) + '.pdf'
filepath = os.path.join('/mnt/data1/csd/papers', filename)
if not os.path.exists(filepath):
    print('file not exists')
```

## 2. convert (deprecated)

曾用于将下载好的论文进行转换分析，使用了简单匹配、模糊匹配、实体识别等简单方法进行分析

## 3. merge (deprecated)

曾用于合并CoRE数据集和QMOF数据集，生成了交集列表，筛选出其中MOF的论文
