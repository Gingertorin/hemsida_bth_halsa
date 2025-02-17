# **Läkemedelsberäkningar**

En webbapplikation för sjuksköterskestudenter vid BTH för at öva på olika läkemedelsberäkningar.

## **Databas**

| Column               | Typ  | Besktivning                                                                          |
|----------------------|------|--------------------------------------------------------------------------------------|
| **id** | int | UID with auto increment. |
| **question** | text | The string for the question. |
| **answer_unit** | text | The unit of the answer store as string. +|
| **answer_formula** | text | A string with the formula to calculate the answer using the variables. |
| **variating_values** | text | A string in JSON format that sets the rules to generate the values for the question. |
| **course** | text| The course code for the question two letters and 4 numbers. |
| **question_type** | text | Short string describing the question type. |

### **Exempel på en fråga i JSON format**

```json
{
    "question": "Omvandla %%var_name%%kg till %%var_name2%%g.",
    "answer_unit": "g",
    "answer_formula": "var_name * 1000",
    "variating_values": "{ 'var_name': [50, 70], 'var_name2': [10, 20] }",
    "course": "KM1423",
    "question_type": "Enhetsomvandling"
}
```

## **Formatering av frågor**

- Variabler omges av `%%variabel_namn%%`.
- Variabelnamn får endast innehålla:
  - **Bokstäver (A-Z, a-z)**
  - **Siffror (0-9)**
  - **Underscore (_)**
  - **Måste börja med en bokstav.**
  - *Inga mellanslag.*
- Specialhantering:
  - `%%name%%` och `%%namn%%` ersätts automatiskt med slumpmässiga namn från en lista.
  - `condition` används för att definiera mer avancerade regler för generering av variabler.

## **Formatering av varierande variabler**

### **Tal inom intervall**

- Anges med `[min, max]`, ex:

  ```json
  { "var1": [4, 16] }
  ```

  **Ger ett heltal mellan 4 och 16.**

### **Decimaltal eller heltal med steg**

- Format `[min, max, steg]`, ex:

  ```json
  { "var4": [1, 10, 0.1] }
  ```

  **Ger ett slumpmässigt värde mellan 1 och 10 med en decimal.**

- Exempel:

  ```json
  { "var5": [-10, 10, 0.5] }
  ```

  **Ger ett slumpmässigt värde mellan -10 och 10 med steg på 0.5.**

> **OBS!** `steg` måste vara mindre än `max - min`.

### **Välj från lista av siffror eller ord**

- Exempel:

  ```json
  { "var2": [20, 10] }
  ```

  **Ger antingen 20 eller 10.**
  
  > **OBS!** Om bara `två värden` anges måste det största anges först.
  
  > **OBS!** Om `tre värden` anges får det inte följa `[min, max, steg]`.

- Exempel med flera alternativ:

  ```json
  { "var3": [5, 10, 15, 20] }
  ```

  **Ger något av värdena 5, 10, 15 eller 20.**

- Exempel:

  ```json
  { "medicin": ["Medicin A", "Medicin B", "Medicin C"] }
  ```

  **Ger en av de specificerade medicinerna.**

## **Avancerade regler**

Vill du ha mer kontroll över hur variabler genereras kan du använda `condition`.

### **Villkor mellan variabler**

- Större än: `>`
- Mindre än: `<`
- Större eller lika med: `>=`
- Mindre eller lika med: `<=`

Exempel:

```json
{ "big_var": [10, 50], "small_var": [1, 10], "condition": "big_var > small_var" }
```

  > **OBS!** `big_var` måste alltid kunna vara större än `small_var`.

### **Regler baserat på en annan variabel**

- istället för en lista sätt variabel till `'var': "varibel_1 ? [1], [2], [3]"`.
- Listorna följer samma regler.
- Exempel:

  ```json
  { "medicin_typ": ["Medicin A", "Medicin B"], "dos": "medicin_typ ? [2, 5, 10], [2, 4, 0.5]" }
  ```

  - Om `medicin_typ = Medicin A`, ges `dos = [2, 5, 10]`
  - Om `medicin_typ = Medicin B`, ges `dos = [2, 4, 0.5]`

> **OBS!** Det måste finnas lika många listor som alternativ för `varibel_1`.

---

### **Exempel JSON på en fullständig fråga med avancerade regler**

```json
{
    "question": "Läkaren har ordinerat %%dosage%% mg x %%antal%% subcutant. Tillgängligt: Morfin %%available_dose%% mg/ml. Hur många ml motsvarar en enkeldos?",
    "answerFormula": "dosage / available_dose",
    "answerUnit": "ml",
    "variatingValues": "{'dosage': [5,10,15,20], 'antal': [1,5], 'available_dose': [5, 10, 15, 20], 'condition': 'dosage <= available_dose'}",
    "course": "KM1423",
    "questionType": "Dosage Calculation"
}
```
