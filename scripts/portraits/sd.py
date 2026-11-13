"""RETRATOS E IMÁGENES DE LOS EXPEDIENTES con un modelo de imagen de pesos abiertos.

Uso (entorno virtual en .cache/sdenv, modelos en .cache/models):
  .cache/sdenv/bin/python scripts/portraits/sd.py --cast=scripts/portraits/cast.json [--only=id,id] [--steps=24]

Todo se genera en local, en CPU: ningún servicio de pago ni API externa.
Modelo: Realistic Vision 5.1 (Stable Diffusion 1.5, licencia CreativeML
OpenRAIL-M) con el VAE sd-vae-ft-mse (MIT). Cada imagen usa una semilla
fija derivada de su id: volver a generar da exactamente el mismo resultado.
Las personas son inventadas: los textos describen rasgos, nunca a alguien real.
"""
import json, os, sys, time, zlib
import torch
from diffusers import StableDiffusionPipeline, AutoencoderKL, DPMSolverMultistepScheduler

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
MODELS = os.path.join(ROOT, '.cache', 'models')
OUT = os.path.join(ROOT, '.cache', 'portraits', 'sd')
os.makedirs(OUT, exist_ok=True)
ARGS = dict(a.lstrip('-').split('=', 1) if '=' in a else (a.lstrip('-'), True) for a in sys.argv[1:])

torch.set_num_threads(os.cpu_count() or 4)

NEGATIVE = ('cartoon, anime, 3d render, cgi, doll, plastic skin, illustration, drawing, deformed, disfigured, '
            'bad anatomy, extra fingers, mutated hands, cross-eyed, text, watermark, signature, logo, frame, '
            'modern clothing, oversaturated, lowres, blurry face')


def pipeline():
    vae = AutoencoderKL.from_pretrained(os.path.join(MODELS, 'vae-mse'), torch_dtype=torch.float32)
    pipe = StableDiffusionPipeline.from_pretrained(os.path.join(MODELS, 'rv51'), vae=vae, torch_dtype=torch.float32,
                                                   safety_checker=None, requires_safety_checker=False)
    pipe.scheduler = DPMSolverMultistepScheduler.from_config(pipe.scheduler.config, use_karras_sigmas=True,
                                                             algorithm_type='dpmsolver++')
    pipe.set_progress_bar_config(disable=True)
    pipe.enable_attention_slicing()
    return pipe


def generate(pipe, key, prompt, negative='', width=512, height=640, steps=24, guidance=6.0, seed_offset=0):
    seed = (zlib.crc32(key.encode()) + seed_offset) % (2 ** 31)
    g = torch.Generator('cpu').manual_seed(seed)
    t = time.time()
    im = pipe(prompt, negative_prompt=(NEGATIVE + ', ' + negative).strip(', '), width=width, height=height,
              num_inference_steps=steps, guidance_scale=guidance, generator=g).images[0]
    print(f'  {key}: {time.time() - t:.0f} s (semilla {seed})', flush=True)
    return im


def main():
    cast = json.load(open(os.path.join(ROOT, ARGS.get('cast', 'scripts/portraits/cast.json'))))
    only = set(str(ARGS['only']).split(',')) if 'only' in ARGS else None
    steps = int(ARGS.get('steps', 24))
    pipe = pipeline()
    for p in cast['people']:
        if only and p['id'] not in only:
            continue
        case = cast['cases'][p['case']]
        prompt = case['prompt'].format(who=p['prompt'])
        n = int(ARGS.get('variants', 1))
        for v in range(n):
            im = generate(pipe, p['id'], prompt, case.get('negative', '') + ', ' + p.get('negative', ''),
                          steps=steps, guidance=case.get('guidance', 6.0), seed_offset=p.get('seed', 0) + v * 7919)
            name = p['id'] + (f'.v{v}' if n > 1 else '') + '.png'
            im.save(os.path.join(OUT, name))
    for item in cast.get('images', []):
        if only and item['id'] not in only:
            continue
        prompt = item['prompt']
        im = generate(pipe, item['id'], prompt, item.get('negative', ''), width=item.get('width', 640),
                      height=item.get('height', 512), steps=steps, guidance=item.get('guidance', 6.0),
                      seed_offset=item.get('seed', 0))
        im.save(os.path.join(OUT, item['id'] + '.png'))


if __name__ == '__main__':
    main()
