<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Contact;
use Inertia\Response;

class MessageController extends Controller
{

    public function contact()
    {
        return Inertia::render('ContactPage');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'contact' => [
                'required',
                'string',
                'max:255',
                function ($attribute, $value, $fail) {
                    $isEmail = filter_var($value, FILTER_VALIDATE_EMAIL) !== false;
                    $isPhone = preg_match('/^\+?[0-9\s\-]{8,20}$/', $value) === 1;

                    if (! $isEmail && ! $isPhone) {
                        $fail('Enter a valid email address or phone number.');
                    }
                },
            ],
            'subject' => ['required', 'string', 'max:255'],
            'message' => ['required', 'string', 'max:5000'],
        ]);

        Contact::create($validated);

        return back()->with('success', 'Your message has been sent successfully.');
    }

    public function index(Request $request): Response
    {
        $messages = Contact::query()
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/Messages/Index', [
            'messages' => $messages,
        ]);
    }

    public function show(Contact $contact): Response
    {
        if (! $contact->is_read) {
            $contact->update(['is_read' => true]);
        }

        return Inertia::render('admin/Messages/Show', [
            'message' => $contact,
        ]);
    }

    public function destroy(Contact $contact)
    {
        $contact->delete();

        return redirect()->route('admin.messages.index')
            ->with('success', "Message deleted.");
    }
}
