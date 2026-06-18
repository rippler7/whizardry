import * as Phaser from 'phaser';

export class FlowField {
  public cellSize: number = 32; // Matches your terrain generation segment sizes
  public cols: number;
  public rows: number;
  public costField: number[][] = [];
  public integrationField: number[][] = [];
  public vectorField: { x: number, y: number }[][] = [];
  
  private scene: Phaser.Scene;
  private targetCell: { x: number, y: number } | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.cols = Math.ceil(scene.scale.width / this.cellSize);
    this.rows = Math.ceil(scene.scale.height / this.cellSize);

    // Initialize arrays
    for (let y = 0; y < this.rows; y++) {
      this.costField[y] = new Array(this.cols).fill(1);
      this.integrationField[y] = new Array(this.cols).fill(65535);
      this.vectorField[y] = Array.from({ length: this.cols }, () => ({ x: 0, y: 0 }));
    }
  }

  public buildCostField(walls: Phaser.Physics.Arcade.StaticGroup, chests: Phaser.Physics.Arcade.Group) {
    const rect = new Phaser.Geom.Rectangle(0, 0, this.cellSize, this.cellSize);
    const allObstacles = [...walls.getChildren(), ...chests.getChildren()];

    // Extract actual physics bodies to respect the 3D depth hitboxes we created earlier!
    const solidBounds = allObstacles.map((obs: any) => {
      const body = obs.body as Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody;
      return body ? new Phaser.Geom.Rectangle(body.x, body.y, body.width, body.height) : obs.getBounds();
    });

    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        this.costField[y][x] = 1; // Default passable
        rect.setPosition(x * this.cellSize, y * this.cellSize);
        
        for (const bound of solidBounds) {
          if (Phaser.Geom.Intersects.RectangleToRectangle(rect, bound)) {
            this.costField[y][x] = 255; // 255 = Impassable Wall
            break;
          }
        }
      }
    }
  }

  public updateTarget(targetWorldX: number, targetWorldY: number) {
    const tx = Math.floor(targetWorldX / this.cellSize);
    const ty = Math.floor(targetWorldY / this.cellSize);

    if (tx < 0 || tx >= this.cols || ty < 0 || ty >= this.rows) return;

    // Optimization: Only run the heavy BFS recalculation if the player actually moved to a new grid cell!
    if (this.targetCell && this.targetCell.x === tx && this.targetCell.y === ty) return;
    this.targetCell = { x: tx, y: ty };

    this.buildIntegrationField();
    this.buildVectorField();
  }

  private buildIntegrationField() {
    for (let y = 0; y < this.rows; y++) this.integrationField[y].fill(65535);
    if (!this.targetCell) return;

    this.integrationField[this.targetCell.y][this.targetCell.x] = 0;
    const queue: {x: number, y: number}[] = [this.targetCell];
    const neighbors = [{ dx: 0, dy: -1 }, { dx: 0, dy: 1 }, { dx: -1, dy: 0 }, { dx: 1, dy: 0 }];

    // Breadth-First Search outwards from the Player
    while (queue.length > 0) {
      const current = queue.shift()!;
      const currentCost = this.integrationField[current.y][current.x];

      for (const n of neighbors) {
        const nx = current.x + n.dx;
        const ny = current.y + n.dy;

        if (nx >= 0 && nx < this.cols && ny >= 0 && ny < this.rows) {
          const cellCost = this.costField[ny][nx];
          if (cellCost === 255) continue; // Skip walls

          if (currentCost + cellCost < this.integrationField[ny][nx]) {
            this.integrationField[ny][nx] = currentCost + cellCost;
            queue.push({ x: nx, y: ny });
          }
        }
      }
    }
  }

  private buildVectorField() {
    const neighbors = [
      { dx: 0, dy: -1 }, { dx: 0, dy: 1 }, { dx: -1, dy: 0 }, { dx: 1, dy: 0 },
      { dx: -1, dy: -1 }, { dx: 1, dy: -1 }, { dx: -1, dy: 1 }, { dx: 1, dy: 1 }
    ];

    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        if (this.costField[y][x] === 255) {
          this.vectorField[y][x] = { x: 0, y: 0 };
          continue;
        }

        let minCost = this.integrationField[y][x];
        let bestDir = { x: 0, y: 0 };

        for (const n of neighbors) {
          const nx = x + n.dx;
          const ny = y + n.dy;

          if (nx >= 0 && nx < this.cols && ny >= 0 && ny < this.rows) {
            // Prevent diagonal pathing from clipping through solid wall corners
            if (n.dx !== 0 && n.dy !== 0 && (this.costField[y][nx] === 255 || this.costField[ny][x] === 255)) continue;

            if (this.integrationField[ny][nx] < minCost) {
              minCost = this.integrationField[ny][nx];
              bestDir = { x: n.dx, y: n.dy };
            }
          }
        }

        // Normalize direction vector
        const mag = Math.sqrt(bestDir.x * bestDir.x + bestDir.y * bestDir.y);
        this.vectorField[y][x] = mag > 0 ? { x: bestDir.x / mag, y: bestDir.y / mag } : { x: 0, y: 0 };
      }
    }
  }

  public getDirection(worldX: number, worldY: number): { x: number, y: number } {
    const tx = Math.floor(worldX / this.cellSize);
    const ty = Math.floor(worldY / this.cellSize);

    if (tx >= 0 && tx < this.cols && ty >= 0 && ty < this.rows) {
      return this.vectorField[ty][tx];
    }
    return { x: 0, y: 0 };
  }
}