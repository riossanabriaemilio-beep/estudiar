from PIL import Image, ImageDraw, ImageFilter
import numpy as np, json
S='/tmp/claude-0/-home-user-estudiar/b13922c0-0ec5-5de1-bbed-5a191895e99b/scratchpad/'
src=Image.open('assets-sigma/snack-flotando.webp').convert('RGB')
im=np.asarray(src).astype(float); H,W,_=im.shape
fondo=np.load(S+'snack-fondo.npy')
obj=Image.fromarray(np.where(fondo,0,255).astype(np.uint8)).copy()
lab=0; comps=[]
while True:
    pts=np.argwhere(np.array(obj)==255)
    if len(pts)==0: break
    y,x=pts[0]
    ImageDraw.floodfill(obj,(int(x),int(y)),1)
    a=np.array(obj)==1
    area=a.sum()
    if area>1500:
        ys,xs=np.nonzero(a)
        col=im[a].mean(0)
        comps.append(dict(mask=a,area=int(area),bbox=(int(xs.min()),int(ys.min()),int(xs.max()),int(ys.max())),col=col))
    obj=Image.fromarray(np.where(a,0,np.array(obj)).astype(np.uint8)).copy()
comps.sort(key=lambda c:-c['area'])
def hull(points):
    pts=sorted(set(map(tuple,points)))
    def cross(o,a,b): return (a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0])
    lo=[];up=[]
    for p in pts:
        while len(lo)>=2 and cross(lo[-2],lo[-1],p)<=0: lo.pop()
        lo.append(p)
    for p in reversed(pts):
        while len(up)>=2 and cross(up[-2],up[-1],p)<=0: up.pop()
        up.append(p)
    return lo[:-1]+up[:-1]
SS=4
salida=[]
for i,c in enumerate(comps):
    if c['col'][2]<25 and i>0:   # sombra del piso (amarillo oscuro sin azul) → fuera
        print('descarto sombra', c['bbox'], c['col'].round()); continue
    a=c['mask']
    # borde del objeto para el casco convexo
    ys,xs=np.nonzero(a)
    pts=np.stack([xs,ys],1)
    h=hull(pts[::7].tolist()+pts[np.argsort(xs)[:50]].tolist()+pts[np.argsort(-xs)[:50]].tolist()+pts[np.argsort(ys)[:50]].tolist()+pts[np.argsort(-ys)[:50]].tolist())
    x0,y0,x1,y1=c['bbox']; pad=6
    x0,y0,x1,y1=max(0,x0-pad),max(0,y0-pad),min(W-1,x1+pad),min(H-1,y1+pad)
    w,hh=x1-x0+1,y1-y0+1
    m=Image.new('L',(w*SS,hh*SS),0); d=ImageDraw.Draw(m)
    if i==0:
        # contorno del paquete marcado a mano sobre la foto (los sellos amarillos se confunden con el fondo)
        BOLSA=[(128,283),(500,212),(858,140),(870,300),(890,500),(905,650),(940,780),(985,900),(1030,1010),(1058,1088),(700,1140),(305,1198),(312,1100),(300,950),(280,800),(262,650),(225,500),(180,380)]
        d.polygon([((px-x0)*SS,(py-y0)*SS) for px,py in BOLSA],fill=255)
        loc=a[y0:y1+1,x0:x1+1]
        real=Image.fromarray((loc*255).astype(np.uint8)).resize((w*SS,hh*SS))
        m=Image.fromarray(np.maximum(np.array(m),np.array(real)))
    else:
        d.polygon([((px-x0)*SS,(py-y0)*SS) for px,py in h],fill=255)
    m=m.resize((w,hh),Image.LANCZOS).filter(ImageFilter.GaussianBlur(0.6))
    # en los trozos, respetar el contorno real (no el casco) donde el fondo es claramente amarillo
    if i>0:
        loc=a[y0:y1+1,x0:x1+1]
        real=Image.fromarray((loc*255).astype(np.uint8)).filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.GaussianBlur(0.8))
        m=Image.fromarray(np.minimum(np.array(m),np.array(real)).astype(np.uint8))
    rgba=src.crop((x0,y0,x1+1,y1+1)).convert('RGBA'); rgba.putalpha(m)
    nombre='paquete' if i==0 else f'trozo-{len(salida)}'
    salida.append(dict(nombre=nombre,x=x0/W*100,y=y0/H*100,w=w/W*100,h=hh/H*100,px=(x0,y0,w,hh)))
    rgba.save(S+f'snack-{nombre}.png')
print(json.dumps([{k:(round(v,2) if isinstance(v,float) else v) for k,v in s.items()} for s in salida],indent=0))
json.dump(salida,open(S+'snack-piezas.json','w'))
# vista previa sobre azul noche
prev=Image.new('RGB',(W,H),(10,30,51))
for s in salida:
    p=Image.open(S+f"snack-{s['nombre']}.png"); prev.paste(p,(s['px'][0],s['px'][1]),p)
prev.resize((W//2,H//2)).save(S+'snack-prev.png')
