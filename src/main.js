import ComboBox from "./components/comboBox/comboBox";

document.addEventListener("DOMContentLoaded", () => {
    const squirrelData = [
        { id: 1, text: "Ardilla Roja", color: "Rojo" },
        { id: 2, text: "Ardilla Gris", color: "Gris" },
        { id: 3, text: "Ardilla Voladora", color: "Marrón" },
        { id: 4, text: "Ardilla de Douglas", color: "Marrón" },
        { id: 5, text: "Ardilla de Prevost", color: "Negro y Naranja" },
        { id: 6, text: "Ardilla de las Filipinas", color: "Negro" },
        { id: 7, text: "Ardilla de Arizona", color: "Gris y Marrón" },
        { id: 8, text: "Ardilla Listada", color: "Amarillo y Marrón" },
        { id: 9, text: "Ardilla Gigante India", color: "Marrón y Amarillo" },
        { id: 10, text: "Ardilla Negra", color: "Negro" },
        { id: 11, text: "Ardilla Blanca", color: "Blanco" },
        { id: 12, text: "Ardilla de África", color: "Gris y Blanco" },
        { id: 13, text: "Ardilla de Cola Anillada", color: "Negro y Blanco" },
        { id: 14, text: "Ardilla del Desierto", color: "Amarillo y Gris" },
        { id: 15, text: "Ardilla de Ceilán", color: "Marrón y Naranja" },
    ];
    // COMBO 1
    ComboBox(squirrelData, {}, {}, "cbSquirrels");
    // COMBO 2
    ComboBox(squirrelData, {
        autoFill: false
    }, {}, "cbSquirrels2");

    document.getElementById("cbSquirrels2").addEventListener("change", function () {
        console.log(`El valor del combo ha cambiado a ${getCb("cbSquirrels2").get(true).text}`);
    });
    // COMBO 3
    ComboBox(squirrelData, {}, {}, "cbSquirrels3");
    getCb("cbSquirrels3").disable();
});
