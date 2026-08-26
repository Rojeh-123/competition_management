<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Helpers\AuditLogger;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Category;
use Illuminate\Http\RedirectResponse;

class CategoryController extends Controller
{
    public function index()
    {
        $categories = Category::all();

        foreach ($categories as $category) {
            $category->competitionCount = $category->competitions()->count();
        }

        return Inertia::render('admin/ManageCategoriesPage', [
            'categories' => $categories,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:categories,name',
            'description' => 'nullable|string|max:1000',
        ]);

        $category = Category::create($validated);

        AuditLogger::log(
            action: 'CREATE',
            table: 'categories',
            recordId: $category->id,
            details: "Created category '{$category->name}'",
            request: $request
        );

        return back()->with('success', 'Category created successfully.');
    }

    public function update(Request $request, Category $category): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:categories,name,' . $category->id,
            'description' => 'nullable|string|max:1000',
        ]);

        $oldName = $category->name;

        $category->update($validated);

        AuditLogger::log(
            action: 'UPDATE',
            table: 'categories',
            recordId: $category->id,
            details: "Updated category '{$oldName}' to '{$category->name}'",
            request: $request
        );

        return back()->with('success', 'Category updated successfully.');
    }

    public function destroy(Request $request, Category $category): RedirectResponse
    {
        $categoryId = $category->id;
        $categoryName = $category->name;

        $category->delete();

        AuditLogger::log(
            action: 'DELETE',
            table: 'categories',
            recordId: $categoryId,
            details: "Deleted category '{$categoryName}'",
            request: $request
        );

        return back()->with('success', 'Category deleted successfully.');
    }
}
