export default class ComparisonTool {
    data: {
        leftTitle: string;
        rightTitle: string;
        leftPoints: string[];
        rightPoints: string[];
    };
    nodes: {
        leftTitle: HTMLInputElement | null;
        rightTitle: HTMLInputElement | null;
        leftList: HTMLDivElement | null;
        rightList: HTMLDivElement | null;
    };

    static get toolbox() {
        return {
            title: "Comparison",
            icon: '<svg width="20" height="20" viewBox="0 0 20 20"><path d="M10 0v20M0 10h20" stroke="currentColor" stroke-width="2"/></svg>',
        };
    }

    constructor({ data }: { data: any }) {
        this.data = {
            leftTitle: data.leftTitle || "Traditional Program",
            rightTitle: data.rightTitle || "Our Program",
            leftPoints: data.leftPoints || [""],
            rightPoints: data.rightPoints || [""],
        };
        this.nodes = {
            leftTitle: null,
            rightTitle: null,
            leftList: null,
            rightList: null,
        };
    }

    render() {
        const container = document.createElement("div");
        container.style.display = "grid";
        container.style.gridTemplateColumns = "1fr 1fr";
        container.style.gap = "20px";
        container.style.padding = "15px";
        container.style.border = "1px dashed #ccc";
        container.style.borderRadius = "8px";
        container.style.backgroundColor = "#f9f9f9";

        const leftCol = this._createColumn("left");
        const rightCol = this._createColumn("right");

        container.appendChild(leftCol);
        container.appendChild(rightCol);

        return container;
    }

    _createColumn(side: "left" | "right") {
        const col = document.createElement("div");
        col.style.display = "flex";
        col.style.flexDirection = "column";
        col.style.gap = "10px";

        const titleInput = document.createElement("input");
        titleInput.value = side === "left" ? this.data.leftTitle : this.data.rightTitle;
        titleInput.placeholder = "Column Title";
        titleInput.style.fontWeight = "bold";
        titleInput.style.padding = "5px";
        titleInput.style.border = "1px solid #ddd";
        titleInput.style.borderRadius = "4px";
        if (side === "left") this.nodes.leftTitle = titleInput;
        else this.nodes.rightTitle = titleInput;

        const listContainer = document.createElement("div");
        listContainer.style.display = "flex";
        listContainer.style.flexDirection = "column";
        listContainer.style.gap = "5px";
        if (side === "left") this.nodes.leftList = listContainer;
        else this.nodes.rightList = listContainer;

        const points = side === "left" ? this.data.leftPoints : this.data.rightPoints;
        points.forEach((point) => {
            this._addPointInput(listContainer, point);
        });

        const addBtn = document.createElement("button");
        addBtn.innerText = "+ Add Point";
        addBtn.type = "button";
        addBtn.style.fontSize = "12px";
        addBtn.style.padding = "5px";
        addBtn.style.marginTop = "5px";
        addBtn.style.cursor = "pointer";
        addBtn.style.border = "1px solid #ccc";
        addBtn.style.borderRadius = "4px";
        addBtn.style.background = "#fff";
        addBtn.onclick = () => this._addPointInput(listContainer, "");

        col.appendChild(titleInput);
        col.appendChild(listContainer);
        col.appendChild(addBtn);

        return col;
    }

    _addPointInput(container: HTMLDivElement, value: string) {
        const wrapper = document.createElement("div");
        wrapper.style.display = "flex";
        wrapper.style.gap = "5px";

        const input = document.createElement("input");
        input.value = value;
        input.placeholder = "Enter point";
        input.style.flex = "1";
        input.style.padding = "3px 8px";
        input.style.fontSize = "14px";
        input.style.border = "1px solid #eee";
        input.style.borderRadius = "4px";

        const delBtn = document.createElement("button");
        delBtn.innerText = "×";
        delBtn.type = "button";
        delBtn.style.color = "red";
        delBtn.style.border = "none";
        delBtn.style.background = "none";
        delBtn.style.cursor = "pointer";
        delBtn.style.fontSize = "18px";
        delBtn.onclick = () => wrapper.remove();

        wrapper.appendChild(input);
        wrapper.appendChild(delBtn);
        container.appendChild(wrapper);
    }

    save() {
        const leftPointsNodes = this.nodes.leftList?.querySelectorAll("input");
        const rightPointsNodes = this.nodes.rightList?.querySelectorAll("input");

        const leftPoints: string[] = [];
        leftPointsNodes?.forEach((node: any) => leftPoints.push(node.value));

        const rightPoints: string[] = [];
        rightPointsNodes?.forEach((node: any) => rightPoints.push(node.value));

        return {
            leftTitle: this.nodes.leftTitle?.value || "",
            rightTitle: this.nodes.rightTitle?.value || "",
            leftPoints: leftPoints.filter((p) => p.trim() !== ""),
            rightPoints: rightPoints.filter((p) => p.trim() !== ""),
        };
    }
}
