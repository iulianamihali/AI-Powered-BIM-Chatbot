from unsloth import FastLanguageModel
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import PeftModel
import torch

base_model_path = "unsloth/mistral-7b-instruct-v0.3-bnb-4bit"
adapter_path = "./mistral-dosetimpex"

model = AutoModelForCausalLM.from_pretrained(base_model_path)

tokenizer = AutoTokenizer.from_pretrained(base_model_path)

model_with_adapter = PeftModel.from_pretrained(model, adapter_path)

model_with_adapter = model_with_adapter.to("cuda")

#print("Adaptor PEFT activ?", isinstance(model_with_adapter, PeftModel))
#print("Adapters în model:", model_with_adapter.peft_config if hasattr(model_with_adapter, "peft_config") else "NU există peft_config")


FastLanguageModel.for_inference(model_with_adapter)

# Definirea prompt-ului
alpaca_prompt = """Mai jos este o instrucțiune care descrie o sarcină. Scrie un răspuns care completează adecvat cererea.

### Instrucțiune:
{}

### Răspuns:
{}"""

inputs = tokenizer(
[
    alpaca_prompt.format(
        "Rezumă următorul text: Building Information Modeling (BIM) este o metodologie modernă utilizată în proiectarea, construcția și operarea clădirilor. Prin utilizarea BIM, echipele de arhitecți, ingineri, antreprenori și proprietari pot colabora pe o platformă digitală comună, care integrează toate informațiile relevante despre proiect. Un avantaj major al BIM este capacitatea de a simula și vizualiza proiectul în 3D înainte de construcție, ceea ce ajută la identificarea conflictelor între diferitele sisteme (arhitectură, structură, instalații) și la reducerea erorilor costisitoare. De asemenea, BIM contribuie la un management mai eficient al resurselor, optimizează planificarea și programarea lucrărilor și permite urmărirea costurilor pe tot parcursul ciclului de viață al clădirii. Un alt beneficiu important este accesul la date actualizate în timp real, care susține luarea unor decizii mai bine informate și facilitează întreținerea și operarea clădirii după finalizarea construcției.",
        ""  # Adaugă un loc pentru răspunsul generat
    )
], return_tensors="pt").to("cuda")

outputs = model_with_adapter.generate(**inputs, max_new_tokens=300, use_cache=True)
result = tokenizer.decode(outputs[0], skip_special_tokens=True, clean_up_tokenization_spaces=True)

raspuns = result.split('### Răspuns:')[1].strip()

("Răspuns generat:\n")
print(raspuns)

