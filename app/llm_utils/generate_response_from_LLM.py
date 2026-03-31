from run_model import tokenizer, model_with_adapter

from app.llm_utils.generate_response_vectors import cauta_context


def verif_cerere_rezumat(user_message: str) -> bool:
    instructiuni_rezumat = [
        "rezumă", "fa un rezumat", "scrie un rezumat", "pune pe scurt",
        "rezumat", "sinteză", "rezumați", "sumarizează", "rezuma"
    ]
    mesaj = user_message.lower()

    rezultat = []
    for cuvant in instructiuni_rezumat:
        if cuvant in mesaj:
            rezultat.append(True)
        else:
            rezultat.append(False)

    return any(rezultat)

alpaca_prompt = """Mai jos este o instrucțiune care descrie o sarcină. Scrie un răspuns care completează adecvat cererea.

    ### Instrucțiune:
    {}

    ### Răspuns:
    {}"""

MAX_TOKENS_INPUT = 1500


def imparte_text_lung(text, tokenizer, max_tokens=MAX_TOKENS_INPUT):
    input_ids = tokenizer.encode(text, return_tensors="pt")[0]
    bucati = []

    for i in range(0, len(input_ids), max_tokens):
        chunk_ids = input_ids[i:i+max_tokens] #slicing pentru impartirea textului
        chunk_text = tokenizer.decode(chunk_ids, skip_special_tokens=True) #transforma textul in limbaj natural
        bucati.append(chunk_text)

    return bucati

def rezuma_bucata(text_bucata):
    prompt = alpaca_prompt.format(f"Rezumă următoarea parte a unui text lung în maxim 150 de cuvinte:\n{text_bucata}", "")
    inputs = tokenizer([prompt], return_tensors="pt").to("cuda")

    outputs = model_with_adapter.generate(**inputs, max_new_tokens=300) #genereaza text pe baza inputului
    result = tokenizer.decode(outputs[0], skip_special_tokens=True) #transf in limbaj natural prima secventa obtinuta
    try:
        return result.split("### Răspuns:")[1].strip()
    except IndexError:
        return result.strip()

def rezumat_final_rezumate(rezumate):
    text_concat = "\n".join(rezumate) #unesc rezumatele in text_concat separate prin new line
    prompt = alpaca_prompt.format(f"Rezumă următoarele puncte cheie extrase dintr-un text lung în maxim 500 de cuvinte:\n{text_concat}", "")
    inputs = tokenizer([prompt], return_tensors="pt").to("cuda")

    print(f"Prompt token count: {len(tokenizer.encode(prompt))}")

    outputs = model_with_adapter.generate(**inputs, max_new_tokens=1500)
    result = tokenizer.decode(outputs[0], skip_special_tokens=True)
    if "### Răspuns:" in result:
        return result.split("### Răspuns:")[1].strip()
    return result.strip()

async def generate_response_from_LLM(user_message: str) -> str:
    if verif_cerere_rezumat(user_message):
        input_ids = tokenizer.encode(user_message, return_tensors="pt")[0] #facem conversia din text natural in numere

        if len(input_ids) <= MAX_TOKENS_INPUT:
            #daca inputul e un text scurt, il procesam fara sa il impartim in segmente
            prompt = alpaca_prompt.format(user_message, "")
            inputs = tokenizer([prompt], return_tensors="pt").to("cuda")

            outputs = model_with_adapter.generate(**inputs, max_new_tokens=2000)
            result = tokenizer.decode(outputs[0], skip_special_tokens=True)
            print(f"Prompt token count: {len(tokenizer.encode(prompt))}")

            try:
                print("Input scurt")
                return result.split("### Răspuns:")[1].strip()
            except IndexError:
                return result.strip()

        else:
            #daca textul e lung il impartim
            bucati = imparte_text_lung(user_message, tokenizer)

            rezumate_intermediare = []
            for b in bucati:
                rezumat = rezuma_bucata(b)
                rezumate_intermediare.append(rezumat)

            return rezumat_final_rezumate(rezumate_intermediare)
    else:
        context = cauta_context(user_message)

        if not context or context.strip() == "": #daca nu gasim context
            #modelul răspunde fără context
            print("Nu s-a găsit context vectorial. Răspund din cunoștințele modelului.")
            prompt = alpaca_prompt.format(user_message, "")
        else:
            #daca gasim context
            print("S-a găsit context vectorial.")
            print("Context găsit:\n", context[:1000])  #Afișează contextul

            prompt = alpaca_prompt.format(f"""Îți ofer un context care ar putea fi relevant. Dacă nu este suficient, răspunde folosind cunoștințele tale generale.
                Context:
                {context[:1000]}
                Întrebare: {user_message}
                Te rog să răspunzi complet la întrebare in maxim 200 de cuvinte și să nu întrerupi răspunsul înainte de final.""", "")

        inputs = tokenizer([prompt], return_tensors="pt").to("cuda")

        outputs = model_with_adapter.generate(**inputs, max_new_tokens=4000)
        result = tokenizer.decode(outputs[0], skip_special_tokens=True)

        return result.split("### Răspuns:")[1].strip() if "### Răspuns:" in result else result.strip()
