import React, { useState, useEffect } from "react";
import {
  Container,
  Header,
  Table,
  Button,
  Modal,
  Input,
  Dropdown,
  Grid,
} from "semantic-ui-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import ProfileNavBar from "../components/ProfileNavBar";
import { supabase } from "../AuthProvider";

const foodOptions = [
  { key: "chicken", text: "Chicken", value: "Chicken", macros: { protein: 30, carbs: 0, fats: 5, calories: 140 } },
  { key: "rice", text: "Rice", value: "Rice", macros: { protein: 5, carbs: 45, fats: 1, calories: 200 } },
  { key: "avocado", text: "Avocado", value: "Avocado", macros: { protein: 2, carbs: 12, fats: 15, calories: 160 } },
  { key: "salmon", text: "Salmon", value: "Salmon", macros: { protein: 25, carbs: 0, fats: 15, calories: 240 } },
  { key: "broccoli", text: "Broccoli", value: "Broccoli", macros: { protein: 3, carbs: 6, fats: 0, calories: 55 } },
  { key: "egg", text: "Egg", value: "Egg", macros: { protein: 6, carbs: 1, fats: 5, calories: 70 } },
  { key: "banana", text: "Banana", value: "Banana", macros: { protein: 1, carbs: 27, fats: 0, calories: 105 } },
];

const defaultMicronutrients = {
  fiber: { value: 25, unit: "g" },
  sugar: { value: 89, unit: "g" },
  saturatedFat: { value: 27, unit: "g" },
  transFat: { value: 0, unit: "g" },
  cholesterol: { value: 300, unit: "mg" },
  sodium: { value: 2300, unit: "mg" },
  potassium: { value: 3500, unit: "mg" },
  iron: { value: 100, unit: "%" },
  vitaminA: { value: "", unit: "" },
  vitaminB: { value: "", unit: "" },
  vitaminC: { value: "", unit: "" },
};

const NutrientTracker = () => {
  const [open, setOpen] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [foodAmount, setFoodAmount] = useState(1);
  const [selectedDate, setSelectedDate] = useState("");
  const [loggedFood, setLoggedFood] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [micronutrients, setMicronutrients] = useState(defaultMicronutrients);
  const [foodOptions, setFoodOptions] = useState([]);

  const [recipeMap, setRecipeMap] = useState({});

  const formatDate = (dateString) => {
    if (!dateString) {
      const today = new Date();
      return today.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).replace(',', '.');
  };

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
  }, []);

  useEffect(() => {
    const fetchFoodOptions = async () => {
      const { data, error } = await supabase
        .from("Recipes")
        .select("id, title")
        .order("title", { ascending: true });

      setFoodOptions(data.map((item) => ({ key: item.id, text: item.title, value: item.id })));
      setRecipeMap(data.reduce((acc, item) => ({ ...acc, [item.id]: item }), {}));
    };
    fetchFoodOptions();
  }, []);


/*
  useEffect(() => {
    if (searchQuery.length > 2) {
      const results = foodOptions.filter(food => 
        food.value.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);
*/
  const handleLogFood = async () => {
    if (selectedFood && selectedDate) {
      const recipe = recipeMap[selectedFood];

      console.log("Recipe ID:", recipe);

      const { data, error } = await supabase
        .functions
        .invoke("fetch-nutrition", {
          body: { ingredient: recipe.title, id: recipe.id }
        });

        
      
      if (error) throw error;

      const nutrition = data.reduce((acc, item) => ({ ...acc, [item.nutrient]: item.amount }), {});

      console.log("Nutrition Data:", nutrition);

      const scaledMacros = { ...nutrition };
      Object.keys(scaledMacros).forEach(key => {
        scaledMacros[key] = Math.round(scaledMacros[key] * foodAmount);
      });

      setLoggedFood([
        ...loggedFood, 
        { 
          recipe,
          nutrition,
          amount: foodAmount,
          macros: scaledMacros,
          date: selectedDate
        }
      ]);
      
      setSelectedFood(null);
      setFoodAmount(1);
      setSearchQuery("");
      setSearchResults([]);
      setOpen(false);
    }
  };

  const dateToDisplay = selectedDate || (loggedFood.length > 0 ? loggedFood[loggedFood.length - 1].date : "");
  const logsToDisplay = loggedFood.filter((food) => food.date === dateToDisplay);

  const totalMacros = logsToDisplay.reduce(
    (acc, food) => {
      acc.protein += food.macros.protein;
      acc.carbs += food.macros.carbs;
      acc.fats += food.macros.fats;
      acc.calories += food.macros.calories;
      return acc;
    },
    { protein: 0, carbs: 0, fats: 0, calories: 0 }
  );

  const pieData = [
    { name: "Protein", value: totalMacros.protein, color: "#D2691E" },
    { name: "Carbohydrates", value: totalMacros.carbs, color: "#8B0000" },
    { name: "Fats", value: totalMacros.fats, color: "#FFA500" }
  ].filter(item => item.value > 0);

  const totalGrams = totalMacros.protein + totalMacros.carbs + totalMacros.fats;
  const proteinPercentage = totalGrams > 0 ? Math.round((totalMacros.protein / totalGrams) * 100) : 0;
  const carbsPercentage = totalGrams > 0 ? Math.round((totalMacros.carbs / totalGrams) * 100) : 0;
  const fatsPercentage = totalGrams > 0 ? Math.round((totalMacros.fats / totalGrams) * 100) : 0;

  return (
    <Container>
      <ProfileNavBar />
      
      <Header as="h2" style={{ color: "#8B0000", marginTop: "2rem" }}>Summary</Header>
      <Header as="h1" style={{ color: "#D75600", margin: "1rem 0 2rem" }}>
        {totalMacros.calories || 0} Total Calories
      </Header>

      <Grid columns={2} stackable>
        <Grid.Column width={8}>
          <Header as="h3">Macros</Header>
          <div style={{ height: 300, position: "relative" }}>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}g`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ 
                display: "flex", 
                justifyContent: "center", 
                alignItems: "center", 
                height: "100%",
                color: "#888" 
              }}>
                No food logged yet
              </div>
            )}
          </div>
          
          <div style={{ marginTop: "1rem", display: "flex", justifyContent: "space-around" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ color: "#D2691E", fontWeight: "bold" }}>Protein</div>
              <div>{totalMacros.protein}g ({proteinPercentage}%)</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ color: "#8B0000", fontWeight: "bold" }}>Carbohydrates</div>
              <div>{totalMacros.carbs}g ({carbsPercentage}%)</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ color: "#FFA500", fontWeight: "bold" }}>Fats</div>
              <div>{totalMacros.fats}g ({fatsPercentage}%)</div>
            </div>
          </div>
        </Grid.Column>
        
        <Grid.Column width={8}>
          <Header as="h3">Micros</Header>
          <Grid columns={3} divided>
            <Grid.Row>
              <Grid.Column>
                <div className="micro-nutrient">Fiber</div>
                <div className="micro-value">{micronutrients.fiber.value} {micronutrients.fiber.unit}</div>
              </Grid.Column>
              <Grid.Column>
                <div className="micro-nutrient">Cholesterol</div>
                <div className="micro-value">{micronutrients.cholesterol.value} {micronutrients.cholesterol.unit}</div>
              </Grid.Column>
              <Grid.Column>
                <div className="micro-nutrient">Vitamin A</div>
                <div className="micro-value">{micronutrients.vitaminA.value} {micronutrients.vitaminA.unit}</div>
              </Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <Grid.Column>
                <div className="micro-nutrient">Sugar</div>
                <div className="micro-value">{micronutrients.sugar.value} {micronutrients.sugar.unit}</div>
              </Grid.Column>
              <Grid.Column>
                <div className="micro-nutrient">Sodium</div>
                <div className="micro-value">{micronutrients.sodium.value} {micronutrients.sodium.unit}</div>
              </Grid.Column>
              <Grid.Column>
                <div className="micro-nutrient">Vitamin B</div>
                <div className="micro-value">{micronutrients.vitaminB.value} {micronutrients.vitaminB.unit}</div>
              </Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <Grid.Column>
                <div className="micro-nutrient">Saturated Fat</div>
                <div className="micro-value">{micronutrients.saturatedFat.value} {micronutrients.saturatedFat.unit}</div>
              </Grid.Column>
              <Grid.Column>
                <div className="micro-nutrient">Potassium</div>
                <div className="micro-value">{micronutrients.potassium.value} {micronutrients.potassium.unit}</div>
              </Grid.Column>
              <Grid.Column>
                <div className="micro-nutrient">Vitamin C</div>
                <div className="micro-value">{micronutrients.vitaminC.value} {micronutrients.vitaminC.unit}</div>
              </Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <Grid.Column>
                <div className="micro-nutrient">Trans Fat</div>
                <div className="micro-value">{micronutrients.transFat.value} {micronutrients.transFat.unit}</div>
              </Grid.Column>
              <Grid.Column>
                <div className="micro-nutrient">Iron</div>
                <div className="micro-value">{micronutrients.iron.value}%</div>
              </Grid.Column>
              <Grid.Column>
                <div className="micro-nutrient"></div>
                <div className="micro-value"></div>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Grid.Column>
      </Grid>

      <Header as="h3" style={{ marginTop: "2rem" }}>
        Food Log - {formatDate(dateToDisplay)}:
      </Header>
      
      <Table celled>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Food</Table.HeaderCell>
            <Table.HeaderCell>Calories</Table.HeaderCell>
            <Table.HeaderCell>Amount</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {logsToDisplay.length > 0 ? (
            logsToDisplay.map((food, index) => (
              <Table.Row key={index}>
                <Table.Cell>{food.recipe.title}</Table.Cell>
                <Table.Cell>{food.nutrition.Calories} calories</Table.Cell>
                <Table.Cell>{food.amount || 1} serving</Table.Cell>
              </Table.Row>
            ))
          ) : (
            <Table.Row>
              <Table.Cell colSpan="3" textAlign="center">No food logged for this date</Table.Cell>
            </Table.Row>
          )}
        </Table.Body>
      </Table>
      
      <Button 
        primary 
        style={{ backgroundColor: "#D75600", marginBottom: "2rem" }} 
        onClick={() => setOpen(true)}
      >
        Log Food
      </Button>
      
      <Modal open={open} onClose={() => setOpen(false)}>
        <Modal.Header>Log Food</Modal.Header>
        <Modal.Content>
          <div style={{ marginBottom: "1rem" }}>
            <label>Date</label>
            <Input
              type="date"
              value={selectedDate}
              fluid
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
          
          <div style={{ marginBottom: "1rem" }}>
            <label>Search Food</label>
            <Dropdown
              search
              selection
              fluid
              placeholder="Type to search foods..."
              options={foodOptions}
              value={selectedFood}
              onChange={(e, { value }) => setSelectedFood(value)}
            />
          </div>
          
          {selectedFood && (
            <div style={{ marginBottom: "1rem" }}>
              <label>Amount (servings)</label>
              <Input
                type="number"
                min="0.25"
                step="0.25"
                value={foodAmount}
                fluid
                onChange={(e) => setFoodAmount(parseFloat(e.target.value) || 1)}
              />
            </div>
          )}
          
        </Modal.Content>
        <Modal.Actions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button primary onClick={handleLogFood} disabled={!selectedFood}>Log</Button>
        </Modal.Actions>
      </Modal>

      <style jsx global>{`
        .micro-nutrient {
          font-weight: bold;
          margin-bottom: 5px;
        }
        .micro-value {
          color: #666;
        }
      `}</style>
    </Container>
  );
};

export default NutrientTracker;