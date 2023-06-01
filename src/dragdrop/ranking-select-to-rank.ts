import { ItemValue, QuestionRankingModel } from "survey-core";
import { DragDropRankingChoices } from "./ranking-choices";

export class DragDropRankingSelectToRank extends DragDropRankingChoices {
  protected findDropTargetNodeByDragOverNode(
    dragOverNode: HTMLElement
  ): HTMLElement {
    if (this.parentElement.isEmpty()) {
      const toContainer: HTMLElement = dragOverNode.closest("[data-ranking='to-container']");
      const fromContainer: HTMLElement = dragOverNode.closest("[data-ranking='from-container']");
      if (!!toContainer) {
        return toContainer;
      } else if (!!fromContainer) {
        return fromContainer;
      } else {
        return null;
      }
    }

    return super.findDropTargetNodeByDragOverNode(dragOverNode);
  }

  protected getDropTargetByDataAttributeValue(dataAttributeValue: string): ItemValue {
    return this.parentElement.rankingChoices[dataAttributeValue] || this.parentElement.unRankingChoices[dataAttributeValue];
  }

  protected getDropTargetByNode(
    dropTargetNode: HTMLElement,
    event: PointerEvent
  ): any {
    if (dropTargetNode.dataset.ranking === "to-container") {
      return "to-container";
    }

    if (dropTargetNode.dataset.ranking === "from-container" || dropTargetNode.closest("[data-ranking='from-container']")) {
      return "from-container";
    }

    return super.getDropTargetByNode(dropTargetNode, event);
  }

  protected isDropTargetValid(
    dropTarget: ItemValue | string,
    dropTargetNode?: HTMLElement
  ): boolean {
    if (dropTarget === "to-container" || dropTarget === "from-container") {
      return true;
    } else {
      return super.isDropTargetValid(<ItemValue>dropTarget, dropTargetNode);
    }
  }

  protected afterDragOver(dropTargetNode: HTMLElement): void {
    const questionModel: any = this.parentElement;
    const rankingChoices = questionModel.rankingChoices;
    const unRankingChoices = questionModel.unRankingChoices;

    let fromIndex;
    let toIndex;

    if (this.isDraggedElementUnranked && this.isDropTargetRanked) {
      fromIndex = unRankingChoices.indexOf(this.draggedElement);
      if (rankingChoices.length === 0) {
        toIndex = 0;
      } else {
        toIndex = rankingChoices.indexOf(this.dropTarget);
      }
      this.selectToRank(questionModel, fromIndex, toIndex);
      this.doUIEffects(dropTargetNode, fromIndex, toIndex);
      return;
    }

    if (this.isDraggedElementRanked && this.isDropTargetRanked) {
      fromIndex = rankingChoices.indexOf(this.draggedElement);
      toIndex = rankingChoices.indexOf(this.dropTarget);
      this.reorderRankedItem(questionModel, fromIndex, toIndex);
      this.doUIEffects(dropTargetNode, fromIndex, toIndex);
      return;
    }

    if (this.isDraggedElementRanked && !this.isDropTargetRanked) {
      fromIndex = rankingChoices.indexOf(this.draggedElement);
      if (unRankingChoices.length === 0) {
        toIndex = 0;
      } else {
        toIndex = unRankingChoices.indexOf(this.dropTarget);
      }
      this.unselectFromRank(questionModel, fromIndex);
      this.doUIEffects(dropTargetNode, fromIndex, toIndex);
      return;
    }
  }

  private doUIEffects(dropTargetNode: HTMLElement, fromIndex: number, toIndex:number) {
    const questionModel: any = this.parentElement;
    const isDropToEmptyRankedContainer = this.dropTarget === "to-container" && questionModel.isEmpty();
    const isNeedToShowIndexAtShortcut = !this.isDropTargetUnranked || isDropToEmptyRankedContainer;
    const shortcutIndex = isNeedToShowIndexAtShortcut ? toIndex + 1 : null;

    this.updateDraggedElementShortcut(shortcutIndex);

    if (fromIndex !== toIndex) {
      dropTargetNode.classList.remove("sv-dragdrop-moveup");
      dropTargetNode.classList.remove("sv-dragdrop-movedown");
      questionModel.dropTargetNodeMove = null;
    }

    if (fromIndex > toIndex) {
      questionModel.dropTargetNodeMove = "down";
    }

    if (fromIndex < toIndex) {
      questionModel.dropTargetNodeMove = "up";
    }
  }

  private get isDraggedElementRanked() {
    return this.parentElement.rankingChoices.indexOf(this.draggedElement) !== -1;
  }

  private get isDropTargetRanked() {
    if (this.dropTarget === "to-container") return true;
    return this.parentElement.rankingChoices.indexOf(this.dropTarget) !== -1;
  }

  private get isDraggedElementUnranked() {
    return !this.isDraggedElementRanked;
  }

  private get isDropTargetUnranked() {
    return !this.isDropTargetRanked;
  }

  public selectToRank(questionModel: QuestionRankingModel, fromIndex: number, toIndex: number): void {
    const rankingChoices = questionModel.rankingChoices;
    const unRankingChoices = questionModel.unRankingChoices;
    const item = unRankingChoices[fromIndex];

    rankingChoices.splice(toIndex, 0, item);
    questionModel.setPropertyValue("rankingChoices", rankingChoices);
  }

  public unselectFromRank(questionModel: QuestionRankingModel, fromIndex: number) {
    const rankingChoices = questionModel.rankingChoices;
    rankingChoices.splice(fromIndex, 1);
    questionModel.setPropertyValue("rankingChoices", rankingChoices);
  }

  public reorderRankedItem(questionModel: QuestionRankingModel, fromIndex: number, toIndex: number): void {
    const rankingChoices = questionModel.rankingChoices;
    const item = rankingChoices[fromIndex];

    rankingChoices.splice(fromIndex, 1);
    rankingChoices.splice(toIndex, 0, item);
    questionModel.setPropertyValue("rankingChoices", rankingChoices);
  }
}
