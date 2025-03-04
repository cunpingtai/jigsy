import { FC, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import * as client from "@/services/client";
import { Category } from "@/services/types";
import { useI18n } from "@/app/[locale]/providers";

interface CategoryModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (category: Category) => void;
  locale: string;
}

export const CategoryModal: FC<CategoryModalProps> = ({
  open,
  onClose,
  onCreated,
  locale,
}) => {
  const { data } = useI18n();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setError("");
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      setError(data.categoryNameRequired);
      return;
    }

    setLoading(true);
    try {
      const response = await client.categoryService.createCategory({
        name: formData.name,
        description: formData.description,
        language: locale,
      });

      if (response && response.id) {
        onCreated(response);
        setFormData({ name: "", description: "" });
      } else {
        setError(data.createCategoryFailed);
      }
    } catch (err) {
      console.error("创建分类错误:", err);
      setError(data.createCategoryFailed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{data.createCategory}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="category-name">{data.categoryName}</Label>
            <Input
              id="category-name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder={data.categoryNamePlaceholder}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category-description">
              {data.categoryDescription}
            </Label>
            <Textarea
              id="category-description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder={data.categoryDescriptionPlaceholder}
              rows={3}
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {data.cancel}
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? data.creating : data.create}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
