# %%
import os
import pandas as pd
import numpy as np


df = pd.read_csv('/mnt/data1/csd/data.csv')
# df.describe(include="all")
download_list = set(df['doi'])
download_list.remove(np.NaN)
len(download_list)

# %%
download_list = list(download_list)
download_list.sort()
with open('doi_list.txt', 'w') as f:
    f.write('\n'.join(download_list))

# %%
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

# %%

def dicfy(s):
    for k, v in url_dic.items():
        s = s.replace(k, v)
    return s.lower()

def rdicfy(s):
    for k, v in url_rdic.items():
        s = s.replace(k, v)
    return s.lower()

# %%
dic = {rdicfy(x.split('/')[-1]): x for x in download_list}
print('len(dic)=', len(dic))

# %% 将已有的复制过去，并统计数量
# cp --remove-destination papers/* ../papers/

from shutil import copyfile

new_paper_path = '/mnt/data1/csd/papers_new/papers'
paper_path = '/mnt/data1/csd/papers'
count = 0
not_download = set(dic.keys())

for f in os.listdir(new_paper_path):
    doi = rdicfy(f[:-4])
    print(doi)
    if doi in dic:
        # print('exists!')
        count += 1
        not_download.discard(doi)
        copyfile(os.path.join(new_paper_path, f), os.path.join(paper_path, doi + '.pdf'))

count

# %%

not_download_lis = [dic[x] for x in not_download]
with open('not_download.txt', 'w') as f:
    f.write('\n'.join(not_download_lis))

# %% 用于验证！！！！

new_paper_path = '/mnt/data1/csd/papers_new/papers'
print('len new', len(os.listdir(new_paper_path)))
not_in_list = []
not_download = set(dic.keys())
cnt = 0

for f in os.listdir(new_paper_path):
    doi = rdicfy(f[:-4]).lower()
    if doi not in dic:
        not_in_list.append(doi)
    else:
        not_download.discard(doi)
        cnt += 1


# new中多余的部分？
print(len(not_in_list), not_in_list[:10])

# 没下载的部分？
print(len(not_download), list(not_download)[:10])

print(cnt)

# %% 


