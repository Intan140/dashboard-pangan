# Jalankan dari folder proyek: python build_data.py
# Membaca CSV star schema di folder data/ lalu membuat js/data.js
import pandas as pd, json, numpy as np
U='data/'
w=pd.read_csv(U+'dim_waktu.csv');wil=pd.read_csv(U+'dim_wilayah.csv');kom=pd.read_csv(U+'dim_komoditas.csv')
g=pd.read_csv(U+'fact_indeks_gabungan.csv');fc=pd.read_csv(U+'fact_forecast.csv');m=pd.read_csv(U+'tabel_mape.csv')
cv=pd.read_csv(U+'disparitas_bulanan.csv');ring=pd.read_csv(U+'ringkasan_provinsi.csv')
cv['id']=pd.to_datetime(cv.bulan).dt.year*100+pd.to_datetime(cv.bulan).dt.month
ids=w.id_waktu.tolist()
mx=g.groupby('kategori').indeks_gabungan.agg(['min','max']);print(mx)
T=[round((mx.loc['Relatif Murah','max']+mx.loc['Normal','min'])/2,3),round((mx.loc['Normal','max']+mx.loc['Relatif Mahal','min'])/2,3),round((mx.loc['Relatif Mahal','max']+mx.loc['Sangat Mahal','min'])/2,3)];print(T)
prov=wil.sort_values('id_wilayah')
G={}
for i,gr in g.groupby('id_waktu'):
    s=gr.set_index('id_wilayah').indeks_gabungan
    G[int(i)]=[int(round(s.get(k,np.nan)*100)) if k in s.index else None for k in prov.id_wilayah]
K=kom.sort_values('id_komoditas').komoditas.tolist()
F={}
for k in kom.id_komoditas:
    d=fc[fc.id_komoditas==k].set_index('id_waktu')
    mm=m[(m.id_komoditas==k)]
    sel=mm[mm.terpilih].iloc[0]
    F[kom.set_index('id_komoditas').komoditas[k]]=dict(
      a=[None if pd.isna(d.harga_aktual.get(i)) else round(d.harga_aktual.get(i)) for i in ids],
      f=[None if pd.isna(d.harga_forecast.get(i)) else round(d.harga_forecast.get(i)) for i in ids],
      lo=[None if pd.isna(d.batas_bawah.get(i)) else round(d.batas_bawah.get(i)) for i in ids],
      hi=[None if pd.isna(d.batas_atas.get(i)) else round(d.batas_atas.get(i)) for i in ids],
      sp=[bool(d.lonjakan.get(i,False)) for i in ids],
      model=sel.model,mape=float(sel.MAPE),
      cv=[(lambda v:None if v is None else round(v,3))(cv[(cv.komoditas==kom.set_index('id_komoditas').komoditas[k])&(cv.id==i)].koefisien_variasi.mean() if ((cv.komoditas==kom.set_index('id_komoditas').komoditas[k])&(cv.id==i)).any() else None) for i in ids],
      mp=[[r.model,r.MAPE,r.RMSE,bool(r.terpilih)] for r in mm.sort_values('MAPE').itertuples()])
R=[[r.provinsi]+[r._asdict()[c] if False else getattr(r,c.replace(' ','_')) for c in K]+[r.rata_rata,r.peringkat] for r in ring.rename(columns=lambda c:c.replace(' ','_')).itertuples(index=False)]
data=dict(ids=ids,low=w[w.cakupan_rendah].id_waktu.tolist(),P=[[r.provinsi,round(r.latitude,2),round(r.longitude,2)] for r in prov.itertuples()],G=G,K=K,F=F,R=R,T=T)
open('js/data.js','w').write('const D='+json.dumps(data,separators=(',',':'))+';\n')
print('js/data.js dibuat')
