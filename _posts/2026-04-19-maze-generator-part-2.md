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

4. Drag your **ActiveStream** variable into the graph. Drag a wire off it and search for:
   `Random Integer in Range`.

5. **Setting the Range:**
   - Leave **Min** at `0`.
   - Drag in your `GridSizeX` variable, add a **Subtract** node, set it to `1`, and plug that into **Max**.

6. **The Connection:** Drag your `GridArray` variable into the graph and select **Get (a copy)**. Plug the result of your random integer into the **Index** pin of the Get node.

---

#### Step 3 — Opening the Door and Starting the Path

Now we physically remove the wall and mark this cell as our starting point.

7. Drag a wire off the blue output pin of the **Get** node and search for `Set Show South Wall`. 
   - Uncheck the box (**False**).
   - Connect the white execution wire from **Sequence (Then 0)** to the input of this node.

8. **CurrentCell Variable:** Right-click the blue output pin of that same **Get** node and select **Promote to Variable**. Name it `CurrentCell`.
   > *This variable is your 'GPS.' It tells the generator exactly which cell it is currently standing in.*

9. **The Memory Lists:** Drag your `VisitedCells` and `CellStack` arrays into the graph. Search for the **Add** node for each.
   - Connect the execution wire from `Set Show South Wall` through both **Add** nodes.
   - Connect your `CurrentCell` variable to the input of both **Add** nodes.

<a href="{{ '/assets/images/blog/Part2-Step-3.png' | relative_url }}" style="flex:1;">
    <img src="{{ '/assets/images/blog/Part2-Step-3.png' | relative_url }}" style="width:100%;" alt="Promoting the starting cell to CurrentCell and adding it to the Visited and Stack arrays." class="post-image">
</a>

---

### Why the "CurrentCell" Matters
From this point forward, the generator stops looking at the whole grid. It only cares about `CurrentCell`. It will look at its neighbors, pick one, move there, and then that neighbor becomes the new `CurrentCell`.



---

### Expected Result
When you hit **Play**, a random tile along the bottom edge of your grid will have its front wall missing. The generator has now "stepped into" the maze and is ready to look for the next room!