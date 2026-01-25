import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TypographyMuted } from '@/components/ui/typography';
import type { PermissionsByCategory } from '@/lib/api/permissions';

interface PermissionsEditorProps {
  permissionsGrouped: PermissionsByCategory;
  selectedPermissionIds: Set<string>;
  onPermissionToggle: (permissionId: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export function PermissionsEditor({
  permissionsGrouped,
  selectedPermissionIds,
  onPermissionToggle,
  isLoading,
  disabled,
}: PermissionsEditorProps) {
  const categories = Object.keys(permissionsGrouped).sort();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardHeader className="pb-3">
              <div className="h-5 w-24 bg-gray-200 rounded" />
            </CardHeader>
            <CardContent className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-4 w-4 bg-gray-200 rounded" />
                  <div className="h-4 w-32 bg-gray-200 rounded" />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-8">
        <TypographyMuted>No permissions available</TypographyMuted>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {categories.map((category) => {
        const permissions = permissionsGrouped[category];
        const categorySelectedCount = permissions.filter((p) =>
          selectedPermissionIds.has(p.id)
        ).length;
        const isAllSelected = categorySelectedCount === permissions.length;
        const isSomeSelected =
          categorySelectedCount > 0 && categorySelectedCount < permissions.length;

        const handleCategoryToggle = () => {
          if (disabled) return;

          if (isAllSelected) {
            // Deselect all in category
            permissions.forEach((p) => {
              if (selectedPermissionIds.has(p.id)) {
                onPermissionToggle(p.id);
              }
            });
          } else {
            // Select all in category
            permissions.forEach((p) => {
              if (!selectedPermissionIds.has(p.id)) {
                onPermissionToggle(p.id);
              }
            });
          }
        };

        return (
          <Card key={category}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <Checkbox
                  id={`category-${category}`}
                  checked={isAllSelected}
                  ref={(el) => {
                    if (el) {
                      (el as HTMLButtonElement & { indeterminate: boolean }).indeterminate =
                        isSomeSelected;
                    }
                  }}
                  onCheckedChange={handleCategoryToggle}
                  disabled={disabled}
                  className="cursor-pointer"
                />
                <CardTitle className="text-base font-semibold">{category}</CardTitle>
                <span className="text-sm text-muted-foreground ml-auto">
                  {categorySelectedCount}/{permissions.length}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {permissions.map((permission) => (
                <div key={permission.id} className="flex items-start gap-3">
                  <Checkbox
                    id={permission.id}
                    checked={selectedPermissionIds.has(permission.id)}
                    onCheckedChange={() => onPermissionToggle(permission.id)}
                    disabled={disabled}
                    className="mt-0.5 cursor-pointer"
                  />
                  <div className="flex-1">
                    <Label htmlFor={permission.id} className="text-sm font-medium cursor-pointer">
                      {permission.name}
                    </Label>
                    {permission.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {permission.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
