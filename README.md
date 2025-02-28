# **Läkemedelsberäkningar**

En webbapplikation för sjuksköterskestudenter vid BTH för at öva på olika läkemedelsberäkningar.

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


### **Exempel JSON på en fullständig fråga med avancerade regler**

```json
    {
        "question": "Läkaren har ordinerat Morfin %%dosage%% mg x %%antal%% subcutant. Tillgängligt: Morfin %%available_dose%% mg/ml. Hur många ml motsvarar en enkeldos?",
        "answer_unit_id": 3,
        "answer_formula": "dosage / available_dose",
        "variating_values": "{'dosage' : [10,15], 'antal': [1,2,3], 'available_dose': [10], 'condition': 'dosage > 'avalible_dose'}",
        "course_code": "KM1424",
        "question_type_id": 2,
    }
```


## **Return from Randome Question **

| Column               | Typ  | Besktivning                                                                          |
|----------------------|------|--------------------------------------------------------------------------------------|
| **id** | int | UID |
| **question** | text | The string for the question. |
| **answer_unit_id** | int | The UID for the correct unit.|
| **answer_formula** | obj | A function for the fomula where the generated numbers can be used as ags to get the answer. |
| **variating_values** | text | A string in JSON format with the generated values in the form of a dictionary. |
| **question_type_id** | int | The UID for the question type. |
| **hint_id** | int | The UID for the hint. |

### **Exempel på en fråga i JSON format**

```json
{
    "question": "Omvandla %%var_name%%kg till %%var_name2%%g.",
    "answer_unit_id": "g",
    "answer_formula": "Func(a,b) -> a + b (var_name + var_name2)",
    "variating_values": "{ 'var_name': 55, 'var_name2': 15 }",
    "question_type_id": 1

}
```