import os

# Ottieni il percorso della cartella dove si trova lo script
folder_path = os.path.dirname(os.path.abspath(__file__))

# Nome del file TypeScript da generare
output_file = os.path.join(folder_path, 'postImgIndexes.ts')

# Rimuovi il file TypeScript se esiste già
if os.path.exists(output_file):
    os.remove(output_file)
    print(f"File {output_file} esistente rimosso.")

# Trova tutti i file nella cartella corrente
try:
    file_list = os.listdir(folder_path)
except Exception as e:
    print(f"Errore durante la scansione della cartella: {e}")
    file_list = []

# Debug: stampa tutti i file trovati
print("File trovati nella cartella:")
for f in file_list:
    print(f)

# Filtra i file che sono immagini (es. con estensioni comuni come .jpeg, .jpg, .png, .webp, .gif)
image_files = [f for f in file_list if f.lower().endswith(('.jpeg', '.jpg', '.png', '.webp', '.gif'))]

# Debug: stampa i file che sono stati considerati come immagini
print("File immagine trovati:")
for img in image_files:
    print(img)

# Inizia a scrivere il file TypeScript
try:
    with open(output_file, 'w') as f:
        f.write("export const postImgIndexes = [\n")
        
        # Scrivi ogni file come elemento dell'array
        for img in image_files:
            f.write(f"    '/storedcatphotos/imgs/{img}',\n")
        
        f.write("];\n")
    
    print(f"File {output_file} creato con successo!")
except Exception as e:
    print(f"Errore durante la scrittura del file: {e}")
