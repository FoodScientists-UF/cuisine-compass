import React, { useState, useEffect, useContext } from "react";
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
import { supabase, AuthContext } from "../AuthProvider";

const NutrientTracker = () => {
  const { session } = useContext(AuthContext);

  const [open, setOpen] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [foodAmount, setFoodAmount] = useState(1);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loggedFood, setLoggedFood] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [foodOptions, setFoodOptions] = useState([]);
  const [foodMap, setFoodMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState('g');
  const [previewNutrition, setPreviewNutrition] = useState(null);


  const formatDate = () => {
    if (!selectedDate) return "";
    
    const [year, month, day] = selectedDate.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    }).replace(',', '.');
  };

  const convertToGrams = (amount, unit) => {
    switch (unit) {
      case 'g': return amount;
      case 'oz': return amount * 28.35;
      case 'tbsp': return amount * 15;
      default: return amount;
    }
  };
  

  useEffect(() => {
    if (session?.user?.id && selectedDate) fetchFoodLogsForDate(selectedDate);
  }, [session?.user?.id, selectedDate]);

  useEffect(() => {
    const fetchFoodOptions = async () => {
      if (!searchQuery || searchQuery.length < 2) return;
      
      try {
        const { data, error } = await supabase
          .functions
          .invoke("fetch-nutrition", {
            body: { ingredient: searchQuery }
          });
          
        if (error) throw error;

        const newFoodMap = data.items.reduce((map, item) => {
          map[item.name] = item;
          return map;
        }, {});
        setFoodMap(newFoodMap);
        
        setFoodOptions(data.items.map(item => ({
          key: item.name,
          text: item.name[0].toUpperCase() + item.name.slice(1),
          value: item.name
        })));

      } catch (error) {
        console.error("Error fetching food options:", error);
      }
    };
    
    const timeoutId = setTimeout(() => {
      fetchFoodOptions();
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  useEffect(() => {
    if (!selectedFood || !foodMap[selectedFood]) {
      setPreviewNutrition(null);
      return;
    }
  
    const nutrition = foodMap[selectedFood].formattedNutrition;
    const grams = convertToGrams(foodAmount, selectedUnit);
  
    const preview = { calories: 0, protein: 0, carbs: 0, fat: 0 };
  
    nutrition.forEach(item => {
      const nutrient = item.nutrient.toLowerCase();
      const amount = parseFloat(item.amount.replace(/[^\d.-]/g, ''));
  
      const scaled = amount * (grams / 100); // assuming per 100g
  
      if (nutrient.includes('calories')) preview.calories = Math.round(scaled);
      if (nutrient.includes('protein')) preview.protein = Math.round(scaled);
      if (nutrient.includes('carbohydrate')) preview.carbs = Math.round(scaled);
      if (nutrient === 'fat') preview.fat = Math.round(scaled);
    });
  
    setPreviewNutrition(preview);
  }, [selectedFood, foodAmount, selectedUnit]);
  

  const fetchFoodLogsForDate = async (date) => {
    if (!session?.user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('nutrition_tracker')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('date', date)
        .maybeSingle();

      if (error) throw error;
      console.log("Data fetched for date:", date, data);

      setLoggedFood(data?.foods || []);
    } catch (error) {
      console.error("Error fetching food logs:", error);
    }
  };

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
  };

  const handleLogFood = async () => {
    if (selectedFood && selectedDate && session?.user?.id) {
      const food = foodMap[selectedFood];

      if (!food) {
        console.error("Selected food not found in map:", selectedFood);
        return;
      }

      console.log("Found food item:", food);
      
      const nutrition = food.formattedNutrition;
      console.log("Nutrition Data:", nutrition);

      const nutritionObject = {};
      const macros = { protein: 0, carbs: 0, fats: 0, calories: 0 };
      
      const foodMicronutrients = {
        Calories: { value: 0, unit: "" },
        Fat: { value: 0, unit: "g" },
        SaturatedFat: { value: 0, unit: "g" },
        Protein: { value: 0, unit: "g" },
        Sodium: { value: 0, unit: "mg" },
        Potassium: { value: 0, unit: "mg" },
        Cholesterol: { value: 0, unit: "mg" },
        Carbohydrates: { value: 0, unit: "g" },
        Fiber: { value: 0, unit: "g" },
        Sugar: { value: 0, unit: "g" }
      };
      
      const amountInGrams = convertToGrams(foodAmount, selectedUnit);
      const multiplier = amountInGrams / 100;
      
      let processedFat = false;
      
      nutrition.forEach(item => {
        if (item.nutrient === 'Serving') return;
        
        const amount = parseFloat(item.amount.replace(/[^\d.-]/g, ''));
        const unit = item.amount.replace(/[\d.-]/g, '').trim();
        
        if (isNaN(amount)) return;
        
        nutritionObject[item.nutrient] = amount;
        
        const nutrientName = item.nutrient;
        
        if (nutrientName === 'Calories') {
          macros.calories = Math.round(amount * multiplier);
          foodMicronutrients.Calories.value = Math.round(amount * multiplier);
          foodMicronutrients.Calories.unit = unit || "";
        } else if (nutrientName === 'Protein') {
          macros.protein = Math.round(amount * multiplier);
          foodMicronutrients.Protein.value = Math.round(amount * multiplier);
          foodMicronutrients.Protein.unit = unit || "g";
        } else if (nutrientName === 'Carbohydrates') {
          macros.carbs = Math.round(amount * multiplier);
          foodMicronutrients.Carbohydrates.value = Math.round(amount * multiplier);
          foodMicronutrients.Carbohydrates.unit = unit || "g";
        } else if (nutrientName === 'Fat') {
          if (!processedFat) {
            macros.fats = Math.round(amount * multiplier);
            foodMicronutrients.Fat.value = Math.round(amount * multiplier);
            foodMicronutrients.Fat.unit = unit || "g";
            processedFat = true;
          } else {
            foodMicronutrients.SaturatedFat.value = Math.round(amount * multiplier);
            foodMicronutrients.SaturatedFat.unit = unit || "g";
          }
        } else if (nutrientName === 'Sodium') {
          foodMicronutrients.Sodium.value = Math.round(amount * multiplier);
          foodMicronutrients.Sodium.unit = unit || "mg";
        } else if (nutrientName === 'Potassium') {
          foodMicronutrients.Potassium.value = Math.round(amount * multiplier);
          foodMicronutrients.Potassium.unit = unit || "mg";
        } else if (nutrientName === 'Cholesterol') {
          foodMicronutrients.Cholesterol.value = Math.round(amount * multiplier);
          foodMicronutrients.Cholesterol.unit = unit || "mg";
        } else if (nutrientName === 'Fiber') {
          foodMicronutrients.Fiber.value = Math.round(amount * multiplier);
          foodMicronutrients.Fiber.unit = unit || "g";
        } else if (nutrientName === 'Sugar') {
          foodMicronutrients.Sugar.value = Math.round(amount * multiplier);
          foodMicronutrients.Sugar.unit = unit || "g";
        }
      });

      const newFoodEntry = { 
        recipe: { title: selectedFood },
        nutrition: nutritionObject,
        macros: macros,
        micronutrients: foodMicronutrients,
        amount: foodAmount,
        date: selectedDate,
        unit: selectedUnit,
      };

      const updatedFoodLogs = [...loggedFood, newFoodEntry];
      
      try {
        
        const { error: upsertError } = await supabase
          .from('nutrition_tracker')
          .upsert({
            user_id: session.user.id,
            date: selectedDate,
            foods: updatedFoodLogs
          });
        
        if (upsertError) throw upsertError;

          
        setLoggedFood(updatedFoodLogs);
        
      } catch (error) {
        console.error("Error saving food log:", error);
        alert("Failed to save food log. Please try again.");
      }
      
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
      const macros = food.macros || {};
      acc.protein += macros.protein || 0;
      acc.carbs += macros.carbs || 0;
      acc.fats += macros.fats || 0;
      acc.calories += macros.calories || 0;
      return acc;
    },
    { protein: 0, carbs: 0, fats: 0, calories: 0 }
  );

  const totalMicronutrients = logsToDisplay.reduce(
    (acc, food) => {
      const micros = food.micronutrients || {};
      
      return {
        Calories: {
          value: (acc.Calories?.value || 0) + (micros.Calories?.value || 0),
          unit: micros.Calories?.unit || acc.Calories?.unit || ""
        },
        Fat: {
          value: (acc.Fat?.value || 0) + (micros.Fat?.value || 0),
          unit: micros.Fat?.unit || acc.Fat?.unit || "g"
        },
        SaturatedFat: {
          value: (acc.SaturatedFat?.value || 0) + (micros.SaturatedFat?.value || 0),
          unit: micros.SaturatedFat?.unit || acc.SaturatedFat?.unit || "g"
        },
        Protein: {
          value: (acc.Protein?.value || 0) + (micros.Protein?.value || 0),
          unit: micros.Protein?.unit || acc.Protein?.unit || "g"
        },
        Sodium: {
          value: (acc.Sodium?.value || 0) + (micros.Sodium?.value || 0),
          unit: micros.Sodium?.unit || acc.Sodium?.unit || "mg"
        },
        Potassium: {
          value: (acc.Potassium?.value || 0) + (micros.Potassium?.value || 0),
          unit: micros.Potassium?.unit || acc.Potassium?.unit || "mg"
        },
        Cholesterol: {
          value: (acc.Cholesterol?.value || 0) + (micros.Cholesterol?.value || 0),
          unit: micros.Cholesterol?.unit || acc.Cholesterol?.unit || "mg"
        },
        Carbohydrates: {
          value: (acc.Carbohydrates?.value || 0) + (micros.Carbohydrates?.value || 0),
          unit: micros.Carbohydrates?.unit || acc.Carbohydrates?.unit || "g"
        },
        Fiber: {
          value: (acc.Fiber?.value || 0) + (micros.Fiber?.value || 0),
          unit: micros.Fiber?.unit || "g"
        },
        Sugar: {
          value: (acc.Sugar?.value || 0) + (micros.Sugar?.value || 0),
          unit: micros.Sugar?.unit || "g"
        }
      };
    },
    {}
  );

  // Round all micronutrient values in one step
  Object.keys(totalMicronutrients).forEach(key => {
    if (totalMicronutrients[key]?.value) {
      totalMicronutrients[key].value = Math.round(totalMicronutrients[key].value);
    }
  });
  
  const roundedMacros = {
    protein: Math.round(totalMacros.protein),
    carbs: Math.round(totalMacros.carbs),
    fats: Math.round(totalMacros.fats),
    calories: Math.round(totalMacros.calories)
  };  

  const pieData = [
    { name: "Protein", value: roundedMacros.protein, color: "#D2691E" },
    { name: "Carbohydrates", value: roundedMacros.carbs, color: "#8B0000" },
    { name: "Fats", value: roundedMacros.fats, color: "#FFA500" }
  ].filter(item => item.value > 0);

  const totalGrams = roundedMacros.protein + roundedMacros.carbs + roundedMacros.fats;
  const proteinPercentage = totalGrams > 0 ? Math.round((roundedMacros.protein / totalGrams) * 100) : 0;
  const carbsPercentage = totalGrams > 0 ? Math.round((roundedMacros.carbs / totalGrams) * 100) : 0;
  const fatsPercentage = totalGrams > 0 ? Math.round((roundedMacros.fats / totalGrams) * 100) : 0;

  return (
    <Container>
      <ProfileNavBar />
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "2rem" }}>
        <Header as="h2" style={{ color: "#8B0000", margin: 0 }}>Summary</Header>
        <div style={{ display: "flex", alignItems: "center" }}>
          <label style={{ marginRight: "10px" }}>Date:</label>
          <Input
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            style={{ width: "180px" }}
          />
        </div>
      </div>
      
      <Header as="h1" style={{ color: "#D75600", margin: "1rem 0 2rem" }}>
        {roundedMacros.calories} Total Calories
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
              <div>{roundedMacros.protein}g ({proteinPercentage}%)</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ color: "#8B0000", fontWeight: "bold" }}>Carbohydrates</div>
              <div>{roundedMacros.carbs}g ({carbsPercentage}%)</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ color: "#FFA500", fontWeight: "bold" }}>Fats</div>
              <div>{roundedMacros.fats}g ({fatsPercentage}%)</div>
            </div>
          </div>
        </Grid.Column>
        
        <Grid.Column width={8}>
          <Header as="h3">Nutrients</Header>
          <Grid columns={3} divided>
            <Grid.Row>
              <Grid.Column>
                <div className="micro-nutrient">Fiber</div>
                <div className="micro-value">{totalMicronutrients.Fiber?.value || 0} {totalMicronutrients.Fiber?.unit || 'g'}</div>
              </Grid.Column>
              <Grid.Column>
                <div className="micro-nutrient">Cholesterol</div>
                <div className="micro-value">{totalMicronutrients.Cholesterol?.value || 0} {totalMicronutrients.Cholesterol?.unit || 'mg'}</div>
              </Grid.Column>
              <Grid.Column>
                <div className="micro-nutrient">Total Fat</div>
                <div className="micro-value">{totalMicronutrients.Fat?.value || 0} {totalMicronutrients.Fat?.unit || 'g'}</div>
              </Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <Grid.Column>
                <div className="micro-nutrient">Sugar</div>
                <div className="micro-value">{totalMicronutrients.Sugar?.value || 0} {totalMicronutrients.Sugar?.unit || 'g'}</div>
              </Grid.Column>
              <Grid.Column>
                <div className="micro-nutrient">Sodium</div>
                <div className="micro-value">{totalMicronutrients.Sodium?.value || 0} {totalMicronutrients.Sodium?.unit || 'mg'}</div>
              </Grid.Column>
              <Grid.Column>
                <div className="micro-nutrient">Saturated Fat</div>
                <div className="micro-value">{totalMicronutrients.SaturatedFat?.value || 0} {totalMicronutrients.SaturatedFat?.unit || 'g'}</div>
              </Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <Grid.Column>
                <div className="micro-nutrient">Carbohydrates</div>
                <div className="micro-value">{totalMicronutrients.Carbohydrates?.value || 0} {totalMicronutrients.Carbohydrates?.unit || 'g'}</div>
              </Grid.Column>
              <Grid.Column>
                <div className="micro-nutrient">Potassium</div>
                <div className="micro-value">{totalMicronutrients.Potassium?.value || 0} {totalMicronutrients.Potassium?.unit || 'mg'}</div>
              </Grid.Column>
              <Grid.Column>
                <div className="micro-nutrient">Protein</div>
                <div className="micro-value">{totalMicronutrients.Protein?.value || 0} {totalMicronutrients.Protein?.unit || 'g'}</div>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Grid.Column>
      </Grid>

      <Header as="h3" style={{ marginTop: "2rem" }}>
        Food Log - {formatDate()}:
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
                <Table.Cell>{food.recipe?.title || food.food?.name || "Unknown"}</Table.Cell>
                <Table.Cell>{Math.round(food.macros?.calories || food.micronutrients?.Calories?.value || 0)} calories</Table.Cell>
                <Table.Cell>{food.amount || 1} {food.unit || 'serving'}</Table.Cell>
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
      
      <Modal open={open} onClose={() => setOpen(false)} size="tiny" style={{ borderRadius: "16px" }}>
        <Modal.Header style={{ fontFamily: "Abhaya Libre, serif", fontWeight: "bold", fontSize: "24px", textAlign: "center", paddingBottom: "0" }}>
          Log Food
        </Modal.Header>

        <Modal.Content style={{ display: "flex", flexDirection: "column", gap: "1rem", padding: "2rem" }}>
          {/* Search Food */}
          <div>
            <label className="abhaya-libre-regular text-md">Search Food</label>
            <Dropdown
              search
              selection
              fluid
              placeholder="Type to search foods..."
              options={foodOptions}
              value={selectedFood}
              onSearchChange={(e, { searchQuery }) => setSearchQuery(searchQuery)}
              onChange={(e, { value }) => setSelectedFood(value)}
              noResultsMessage={searchQuery.length < 2 ? "Type at least 2 characters to search" : "No results found"}
              style={{ borderRadius: "12px", marginTop: "6px" }}
            />
          </div>

          {/* Amount */}
          {selectedFood && (
            <>
              <div>
                <label className="abhaya-libre-regular text-md">Amount</label>
                <Input
                  type="number"
                  min="0.25"
                  step="0.25"
                  value={foodAmount}
                  fluid
                  onChange={(e) => {
                    const value = e.target.value;
                    setFoodAmount(value === "" ? "" : Math.round(value));
                  }}
                  style={{ borderRadius: "12px", marginTop: "6px" }}
                />
              </div>

              {/* Unit */}
              <div>
                <label className="abhaya-libre-regular text-md">Unit</label>
                <Dropdown
                  selection
                  fluid
                  options={[
                    { key: 'g', text: 'Grams (g)', value: 'g' },
                    { key: 'oz', text: 'Ounces (oz)', value: 'oz' },
                    { key: 'tbsp', text: 'Tablespoons (tbsp)', value: 'tbsp' }
                  ]}
                  value={selectedUnit}
                  onChange={(e, { value }) => setSelectedUnit(value)}
                  style={{ borderRadius: "12px", marginTop: "6px" }}
                />
              </div>

              {/* Nutrition Preview */}
              {previewNutrition && (
                <div style={{ 
                  marginTop: "1rem", 
                  padding: "1rem", 
                  backgroundColor: "#f8f8f8", 
                  borderRadius: "12px",
                  fontFamily: "Abhaya Libre, serif",
                  fontSize: "16px",
                  color: "#444",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px"
                }}>
                  <span><strong>Calories:</strong> {previewNutrition.calories} kcal</span>
                  <span><strong>Protein:</strong> {previewNutrition.protein} g</span>
                  <span><strong>Carbs:</strong> {previewNutrition.carbs} g</span>
                  <span><strong>Fat:</strong> {previewNutrition.fat} g</span>
                </div>
              )}
            </>
          )}
        </Modal.Content>

        <Modal.Actions style={{ display: "flex", flexDirection: "column", gap: "1rem", padding: "2rem" }}>
          <Button
            onClick={handleLogFood}
            disabled={!selectedFood}
            style={{
              backgroundColor: selectedFood ? "#D75600" : "#ccc",
              color: "white",
              width: "100%",
              fontSize: "18px",
              fontFamily: "Abhaya Libre, serif",
              fontWeight: "bold",
              borderRadius: "12px",
              padding: "12px",
            }}
          >
            Log
          </Button>

          <Button
            onClick={() => setOpen(false)}
            style={{
              backgroundColor: "white",
              color: "#333",
              border: "1px solid #ccc",
              width: "100%",
              fontSize: "16px",
              fontFamily: "Abhaya Libre, serif",
              borderRadius: "12px",
              padding: "10px",
            }}
          >
            Cancel
          </Button>
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