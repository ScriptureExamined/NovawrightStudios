---
layout: post
title: "Building a Procedural Maze Generator in UE5 Blueprints Part 1"
date: 2026-04-18
author: Roberta
categories: [Tutorials]
published: false
excerpt: >
  In this series, we build a procedurally generated maze from scratch using Unreal Engine 5. In Part 1, we laid the foundation: creating the Maze Cell, setting up the Random Seed engine, and spawning the initial Grid. In this part, we will prepare the Logic Machine for carving: identifying the Entrance and setting up the "Stack" (the memory of where the generator has been).
---

# Procedural Maze Generation in UE5: Part 2 — The Random Entrance

Now that our "waffle" grid is built and stored in memory, we need to pick a starting point. Instead of always starting in the same corner, we will use our **ActiveStream** to pick a random tile on the bottom row to be our entrance.

---

#### Step 1 — Transitioning from the Loops

We need to wait for the entire grid to finish spawning before we can pick an entrance. 

1. Find your **For Loop (X)** (the very first loop from Part 1).
2. Look for the white **Completed** pin on the right side of that node.
3. Drag a wire from **Completed** and search for a **Sequence** node. 
   > *A Sequence node is like a power strip. It lets us run multiple sets of logic one after another. Pin **Then 0** will handle our Entrance, and we will use **Then 1** later for the carving algorithm.*

<a href="{{ '/assets/images/blog/Part2-Step-1.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part2-Step-1.png' | relative_url }}" style="width:100%;" alt="Connecting the Completed pin of the For Loop to a new Sequence node." class="post-image">
</a>

---

#### Step 2 — Picking a Random Entrance

To keep the entrance on the "South" border, we need to pick a random index from the very first row we spawned (Index 0 to GridSizeX - 1).

4. **Access the Stream:** Drag your `ActiveStream` variable from the Variables list into the graph. A small menu will appear; select **Get ActiveStream**.
   - Drag a wire out from the blue pin and search for: `Random Integer in Range from Stream`.

5. **Setting the Range:**
   - Leave **Min** at `0`.
   - Drag your `GridSizeX` variable into the graph and select **Get GridSizeX**.
   - Drag a wire off `GridSizeX`, type `-`, and select the **Subtract** node. 
   - Type `1` in the bottom box and plug the result into the **Max** pin of the Random node.

6. **The Connection:** Drag your `GridArray` variable into the graph and select **Get GridArray**.
   - Drag a wire off the `GridArray` node and search for **Get (a copy)**.
   - Connect the green **Return Value** from your "Random Integer in Range" node into the green **Index** pin of this new Get node.

<a href="{{ '/assets/images/blog/Part2-Step-2.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part2-Step-2.png' | relative_url }}" style="width:100%;" alt="Detailed breakdown of selecting a random index from the GridArray using ActiveStream and GridSizeX." class="post-image">
</a>

---

#### Step 3 — Opening the Door and Starting the Path

Now we physically remove the wall and mark this cell as our starting point.

7. **Execute the Wall Change:** Drag a wire off the blue output pin of the **Get (a copy)** node from Step 2 and search for `Set Show South Wall`. 
   - Uncheck the box (**False**).
   - **The Connection:** Connect the white execution wire from **Sequence (Then 0)** to the input pin of this node.

8. **Set the CurrentCell:** Drag a wire off the white execution pin of `Set Show South Wall` and search for **Set CurrentCell**.
   - **The Data Connection:** Drag a wire from the blue output pin of your **Get (a copy)** node (the one we used for the wall) and plug it into the blue input pin of **Set CurrentCell**.

9. **Mark as Visited:** Drag your `VisitedCells` array variable into the graph as **Get**. Drag a wire off and search for **Add** and select it.
   - **The Execution Connection:** Connect the white execution wire from **Set CurrentCell** to this **Add** node.
   - **The Data Connection:** Drag your `CurrentCell` variable into the graph (Get) and connect it to the blue input pin of this node.

10. **Start the Stack:** Drag your `CellStack` array variable into the graph as **Get**. Drag off the pin  and select **Add**.
    - **The Execution Connection:** Connect the white execution wire from the **VisitedCells Add** node to this **CellStack Add** node.
    - **The Data Connection:** Connect your **CurrentCell** variable to this blue input pin as well.

<a href="{{ '/assets/images/blog/Part2-Step-3.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part2-Step-3.png' | relative_url }}" style="width:100%;" alt="The completed execution chain: Sequence to Wall Visibility, to Setting the CurrentCell, and finally adding it to the Visited and Stack arrays." class="post-image">
</a>

---

### Why the "CurrentCell" Matters
From this point forward, the generator stops looking at the whole grid. It only cares about `CurrentCell`. It will look at its neighbors, pick one, move there, and then that neighbor becomes the new `CurrentCell`.

---

### Expected Result
When you hit **Play**, a random tile along the bottom edge of your grid will have its front wall missing. The generator has now "stepped into" the maze and is ready to look for the next room!